import { Request, Response } from "express";
import { executeWorkflow } from "../services/orchestratorService.js";
import { WorkflowErrorResponse, WorkflowSuccessResponse } from "../types/workflow-response.types.js";

export const triggerWorkflowController = async (req: Request, res: Response) => {
  const { workflowCode } = req.params;

  let endpoints: string[] = [];
  if (typeof req.query.apiEndpoint === "string") endpoints = [req.query.apiEndpoint];
  else if (Array.isArray(req.body?.endpoints)) endpoints = req.body.endpoints;
  else if (typeof req.body?.endpoint === "string") endpoints = [req.body.endpoint];

  if (!endpoints.length) {
    const errorResponse: WorkflowErrorResponse = {
      success: false,
      transactionId: `tx_${Date.now()}`,
      message: "No downstream endpoint provided",
      workflowTrace: [],
      diagnosticCodes: [],
      data: null,
      errors: { reason: "Missing endpoint" },
      meta: { timestamp: new Date().toISOString(), apiVersion: "v1", engineVersion: "1.0.0" }
    };
    return res.status(400).json(errorResponse);
  }

  const transactionId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const startTime = Date.now();

  try {
    const results = [];
    for (const ep of endpoints) {
      const result = await executeWorkflow(
        workflowCode,
        ep,
        { body: req.body, headers: req.headers, query: req.query },
        transactionId,
        req.method
      );
      results.push(result);
    }

    const payload = results.length === 1 ? results[0] : results;
    const allSteps = Array.isArray(payload)
      ? payload.flatMap(p => p.workflowSteps)
      : payload.workflowSteps;

    const totalDurationMs = Array.isArray(payload)
      ? payload.reduce((acc, p) => acc + p.totalMs, 0)
      : payload.totalMs;

    const stepCount = allSteps.length;

    const successResponse: WorkflowSuccessResponse = {
      success: true,
      transactionId,
      message: "Workflow executed successfully",
      configSummary: {
        microservice: Array.isArray(payload)
          ? payload.map(p => p.microservice.name).join(",")
          : payload.microservice.name,
        url: endpoints.join(","),
        tokenCheck: allSteps.some(s => s.step === "TokenCheck"),
        otpFlow: allSteps.some(s => s.step === "OTPFlow"),
        notification: allSteps.some(s => s.step === "Notification"),
        workflowVersion: "1.0.0",
        stepCount
      },
      workflowTrace: allSteps,
      timing: { start: new Date(startTime).toISOString(), end: new Date().toISOString(), durationMs: totalDurationMs },
      diagnosticCodes: [],
      data: { downstreamResponse: Array.isArray(payload) ? payload.map(p => p.downstreamBody) : payload.downstreamBody },
      errors: null,
      meta: { timestamp: new Date().toISOString(), apiVersion: "v1", engineVersion: "1.0.0" }
    };

    res.status(200).json(successResponse);
  } catch (err: any) {
    const errorResponse: WorkflowErrorResponse = {
      success: false,
      transactionId,
      message: err.message || "Workflow execution failed",
      otpGenerated: false,
      workflowTrace: err.workflowSteps || [],
      diagnosticCodes: [],
      data: null,
      errors: err.details || { reason: err.message },
      meta: { timestamp: new Date().toISOString(), apiVersion: "v1", engineVersion: "1.0.0" }
    };
    res.status(500).json(errorResponse);
  }
};