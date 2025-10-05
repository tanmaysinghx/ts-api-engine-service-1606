import { Request, Response } from "express";
import { getApplicationById, listWorkflowsForMicroservice, onboardApplication, onboardWorkflow } from "../services/onboardingService.js";

/**
 * Onboard a microservice/application
 */
export const onboardApplicationController = async (req: Request, res: Response) => {
  const { microserviceId } = req.params;
  const body = req.body;

  if (!microserviceId) return res.status(400).json({ success: false, message: "microserviceId required" });

  try {
    const service = await onboardApplication(microserviceId, body);
    return res.status(200).json({
      success: true,
      message: "Microservice onboarded successfully",
      data: { microserviceId: service.microserviceId, name: service.name }
    });
  } catch (err: any) {
    console.error("OnboardApplication Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get microservice/application by ID
 */
export const getApplicationController = async (req: Request, res: Response) => {
  const { microserviceId } = req.params;

  try {
    const service = await getApplicationById(microserviceId);
    if (!service) return res.status(404).json({ success: false, message: "Microservice not found" });

    return res.status(200).json({ success: true, data: service });
  } catch (err: any) {
    console.error("GetApplication Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Onboard a workflow (service endpoint)
 */
export const onboardWorkflowController = async (req: Request, res: Response) => {
  const { microserviceId } = req.params;
  const workflowData = req.body;

  try {
    const workflow = await onboardWorkflow(microserviceId, workflowData);
    return res.status(200).json({
      success: true,
      message: "Workflow onboarded successfully",
      data: workflow
    });
  } catch (err: any) {
    console.error("OnboardWorkflow Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * List all workflows for a microservice
 */
export const listWorkflowsController = async (req: Request, res: Response) => {
  const { microserviceId } = req.params;

  try {
    const workflows = await listWorkflowsForMicroservice(microserviceId);
    return res.status(200).json({ success: true, data: workflows });
  } catch (err: any) {
    console.error("ListWorkflows Error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
