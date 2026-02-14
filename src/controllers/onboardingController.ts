import { Request, Response } from "express";
import { getApplicationById, listWorkflowsForMicroservice } from "../services/onboardingService.js";

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
