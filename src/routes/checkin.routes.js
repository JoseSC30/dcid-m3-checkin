import { Router } from "express";
import { registerCheckinRoutes } from "../controllers/checkin.controller.js";
const router = Router();
registerCheckinRoutes(router);
export default router;
