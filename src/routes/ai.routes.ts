import { Router } from "express";
import { askAI } from "../controllers/ai.controller";

const router = Router();

router.post("/api/askAI", askAI);

export { router as aiRouter };
