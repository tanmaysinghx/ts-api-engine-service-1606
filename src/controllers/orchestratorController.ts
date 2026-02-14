import { Request, Response } from "express";
import { executeWorkflow } from "../services/orchestratorService.js";
import { WorkflowErrorResponse, WorkflowSuccessResponse } from "../types/workflow-response.types.js";

export const triggerWorkflowController = async (req: Request, res: Response) => {
  const { workflowCode } = req.params;

  const transactionId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const startTime = Date.now();

  try {
    // New Logic: Endpoint is determined by workflowCode (config), not passed by client.
    const result = await executeWorkflow(
      workflowCode,
      { body: req.body, headers: req.headers, query: req.query },
      transactionId,
      req.method
    );

    const payload = result;
    const allSteps = payload.workflowSteps;
    const totalDurationMs = payload.totalMs; // payload is single object now
    const stepCount = allSteps.length;
    const summaryMicroservice = payload.microservice.name;

    const successResponse: WorkflowSuccessResponse = {
      success: true,
      transactionId,
      message: "Workflow executed successfully",
      configSummary: {
        microservice: summaryMicroservice,
        url: payload.downstreamBody ? "downstream-call" : "no-call",
        tokenCheck: allSteps.some((s: { step: string; }) => s.step === "TokenCheck"),
        otpFlow: allSteps.some((s: { step: string; }) => s.step === "OTPFlow"),
        notification: allSteps.some((s: { step: string; }) => s.step === "Notification"),
        workflowVersion: "1.0.0",
        stepCount
      },
      workflowTrace: allSteps,
      timing: {
        start: new Date(startTime).toISOString(),
        end: new Date().toISOString(),
        durationMs: totalDurationMs
      },
      diagnosticCodes: [],
      data: {
        downstreamResponse: payload.downstreamBody
      },
      errors: null,
      meta: { timestamp: new Date().toISOString(), apiVersion: "v1", engineVersion: "1.0.0" }
    };

    res.status(200).json(successResponse);
  } catch (err: any) {
    const errorResponse: WorkflowErrorResponse = {
      success: false,
      transactionId,
      message: err.message || "Workflow execution failed",
      workflowTrace: err.workflowSteps || [],
      diagnosticCodes: [],
      data: null,
      errors: err.details || { reason: err.message },
      meta: { timestamp: new Date().toISOString(), apiVersion: "v1", engineVersion: "1.0.0" }
    };
    res.status(500).json(errorResponse);
  }
};