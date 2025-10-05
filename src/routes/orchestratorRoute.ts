import { Router } from "express";
import { triggerWorkflowController } from "../controllers/orchestratorController.js";

const router = Router();

router.all("/trigger-workflow/:workflowCode", triggerWorkflowController);

export default router;