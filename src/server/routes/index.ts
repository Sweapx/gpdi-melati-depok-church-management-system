import { Router } from "express";
import authRouter from "./auth.ts";
import apiRouter from "./api-postgres.ts";

const router = Router();

router.use("/auth", authRouter);
router.use("/", apiRouter);

export default router;
