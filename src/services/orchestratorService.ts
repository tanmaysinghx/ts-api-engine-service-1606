import Workflow from "../models/WorkflowSchema.js";
import ServiceRegistry from "../models/ServiceRegistrySchema.js";
import axios, { AxiosRequestConfig } from "axios";

/**
 * Normalize endpoint string to start with '/'
 */
function normalizeEndpoint(ep: string): string {
  if (!ep) return "/";
  return ep.startsWith("/") ? ep : "/" + ep;
}

/**
 * Execute a single workflow endpoint
 */
export const executeWorkflow = async (
  workflowCode: string,
  apiEndpoint: string,
  requestData: { body?: any; headers?: any; query?: any },
  transactionId: string,
  originalMethod?: string
) => {
  const startTime = Date.now();

  const workflow = await Workflow.findOne({ workflowId: workflowCode }).lean();
  if (!workflow) throw new Error(`Workflow ${workflowCode} not found`);

  const service = await ServiceRegistry.findOne({ microserviceId: workflow.microserviceId }).lean();
  if (!service) throw new Error(`Microservice ${workflow.microserviceId} not registered`);

  const env = workflow.environment || "local";

  // Determine base URL
  let baseUrl: string | undefined;
  if (service.baseUrls) {
    if (typeof service.baseUrls.get === "function") baseUrl = (service.baseUrls as unknown as Map<string, string>).get(env);
    if (!baseUrl && (service.baseUrls as any)[env]) baseUrl = (service.baseUrls as any)[env];
  }
  baseUrl = baseUrl || (service as any).baseUrl || (service as any).baseURI;
  if (!baseUrl) throw new Error(`Base URL not found for environment '${env}' for microservice ${service.microserviceId}`);

  const endpointPath = normalizeEndpoint(apiEndpoint);
  const fullUrl = baseUrl.replace(/\/+$/, "") + endpointPath;

  const steps: any[] = [];

  // Token check placeholder
  if (workflow.tokenCheck) {
    steps.push({ step: "TokenCheck", status: "SKIPPED_OR_PASSED", timestamp: new Date().toISOString() });
  }

  // OTP flow placeholder
  if (workflow.otpFlow) {
    steps.push({ step: "OTPFlow", status: "PENDING", timestamp: new Date().toISOString() });
  }

  // Prepare headers
  const forwardHeaders = { ...requestData.headers };
  ["host", "connection", "content-length"].forEach(h => delete forwardHeaders[h]);
  forwardHeaders["x-orchestrator-transaction-id"] = transactionId;

  const method = (workflow.method || originalMethod || "GET").toUpperCase();

  const axiosConfig: AxiosRequestConfig = {
    url: fullUrl,
    method: method as any,
    headers: forwardHeaders,
    ...(requestData.query ? { params: requestData.query } : {}),
    ...(requestData.body ? { data: requestData.body } : {}),
    timeout: 60000, // 60s timeout
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

  // Notification placeholder
  if (workflow.notification && Array.isArray(workflow.notificationSteps) && workflow.notificationSteps.length > 0) {
    for (const n of workflow.notificationSteps) {
      steps.push({ step: "Notification", type: n.type, status: "QUEUED", timestamp: new Date().toISOString() });
    }
  }

  const totalMs = Date.now() - startTime;

  return {
    workflowCode,
    microservice: { id: service.microserviceId, name: service.name, environment: env },
    workflowSteps: steps,
    totalMs,
    downstreamBody: downstreamResponse
  };
};