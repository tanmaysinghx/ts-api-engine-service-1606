import { Router } from "express";
import {
  listWorkflowsController,
  getApplicationController
} from "../controllers/onboardingController.js";

const router = Router();

router.get("/application/:microserviceId", getApplicationController);

router.get("/service/:microserviceId", listWorkflowsController);

export default router;
