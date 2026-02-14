import { ConfigLoader } from "../config/ConfigLoader.js";
import axios, { AxiosRequestConfig } from "axios";
import { INotificationStep } from "../types/config.types.js";

function normalizeEndpoint(ep: string): string {
  if (!ep) return "/";
  return ep.startsWith("/") ? ep : "/" + ep;
}

export const executeWorkflow = async (workflowId: string, requestData: { body?: any; headers?: any; query?: any }, transactionId: string, originalMethod?: string) => {
  const startTime = Date.now();

  const config = ConfigLoader.getInstance().getWorkflow(workflowId);

  if (!config) {
    throw new Error(`Workflow ${workflowId} not found`);
  }

  const { workflow, service } = config;
  // Priority: 1. System Env (TARGET_ENV) -> 2. Workflow Default -> 3. 'local'
  const env = process.env.TARGET_ENV || workflow.environment || "local";

  let baseUrl: string | undefined = service.baseUrls[env];

  // Fallback: if specific env not found, try 'local' or first available
  if (!baseUrl) {
    baseUrl = service.baseUrls['local'] || Object.values(service.baseUrls)[0];
  }

  if (!baseUrl) throw new Error(`Base URL not found for environment '${env}' for microservice ${service.id}`);

  const endpointPath = normalizeEndpoint(workflow.path);
  const fullUrl = baseUrl.replace(/\/+$/, "") + endpointPath;

  const steps: any[] = [];

  if (workflow.steps.tokenCheck) {
    steps.push({ step: "TokenCheck Step", status: "SKIPPED_OR_PASSED", timestamp: new Date().toISOString() });
  }

  if (workflow.steps.otpFlow) {
    steps.push({ step: "OTPFlow Step", status: "PENDING", timestamp: new Date().toISOString() });
  }

  // "notifications" is an array in the new config, but was a boolean flag + array in old model.
  // We check if the array exists and has items.
  const hasNotifications = workflow.steps.notifications && workflow.steps.notifications.length > 0;

  if (hasNotifications) {
    steps.push({ step: "Notification Step", status: "PENDING", timestamp: new Date().toISOString() });
  }

  steps.push({ step: "Log API call", status: "SUCCESS", timestamp: new Date().toISOString() });

  const forwardHeaders = { ...requestData.headers };
  ["host", "connection", "content-length"].forEach(h => delete forwardHeaders[h]);
  forwardHeaders["x-orchestrator-transaction-id"] = transactionId;

  const method = (workflow.method || originalMethod || "GET").toUpperCase();

  console.log(`[Orchestrator] Calling ${method} ${fullUrl} for workflow ${workflowId}`);

  const axiosConfig: AxiosRequestConfig = {
    url: fullUrl,
    method: method as any,
    headers: forwardHeaders,
    ...(requestData.query ? { params: requestData.query } : {}),
    ...(requestData.body ? { data: requestData.body } : {}),
    timeout: 60000,
    validateStatus: () => true
  };

  const callStart = Date.now();
  let downstreamResponse: any;
  let statusCode = 502;

  try {
    const resp = await axios(axiosConfig);
    downstreamResponse = resp.data;
    statusCode = resp.status;
    steps.push({
      step: "ServiceCall",
      url: fullUrl,
      method,
      status: "SUCCESS",
      statusCode,
      durationMs: Date.now() - callStart,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    steps.push({
      step: "ServiceCall",
      url: fullUrl,
      method,
      status: "FAILED",
      error: err.message,
      durationMs: Date.now() - callStart,
      timestamp: new Date().toISOString()
    });
    throw { message: `Downstream call failed: ${err.message}`, workflowSteps: steps, details: err };
  }

  if (hasNotifications && workflow.steps.notifications) {
    for (const n of workflow.steps.notifications) {
      if (n.enabled !== false) { // Default to true if undefined
        steps.push({ step: "Notification", type: n.type, status: "QUEUED", timestamp: new Date().toISOString() });
      }
    }
  }

  const totalMs = Date.now() - startTime;

  return {
    workflowCode: workflowId,
    microservice: { id: service.id, name: service.name, environment: env },
    workflowSteps: steps,
    totalMs,
    downstreamBody: downstreamResponse
  };
};