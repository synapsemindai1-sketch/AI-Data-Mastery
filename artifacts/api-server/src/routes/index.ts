import { Router, type IRouter } from "express";
import healthRouter from "./health";
import coursesRouter from "./courses";
import lessonsRouter from "./lessons";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(coursesRouter);
router.use(lessonsRouter);
router.use(dashboardRouter);

export default router;
