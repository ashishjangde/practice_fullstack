import { Router } from "express";
import { getAllSessionController } from "../controller/session.controller";
import { authMiddleware } from "../middlewares/auth.middleware";


const sessionRouter = Router();


sessionRouter.get("", getAllSessionController)



export default sessionRouter;
