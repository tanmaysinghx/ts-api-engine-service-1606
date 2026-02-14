import { Router } from "express";
import { getConfig, getLogs } from "../controllers/adminController.js";

const router = Router();

router.get("/config", getConfig);
router.get("/logs", getLogs);

export default router;
