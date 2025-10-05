import { Router } from "express";
import {
  onboardApplicationController,
  onboardWorkflowController,
  listWorkflowsController,
  getApplicationController
} from "../controllers/onboardingController.js";

const router = Router();

router.post("/application/:microserviceId", onboardApplicationController);

router.get("/application/:microserviceId", getApplicationController);

router.post("/service/:microserviceId", onboardWorkflowController);

router.get("/service/:microserviceId", listWorkflowsController);

export default router;
