import { Router } from "express";
import { getAllSessionController, DeleteSessionById, DeleteAllSessionExceptCurrent } from "../controller/session.controller";
import { authMiddleware } from "../middlewares/auth.middleware";


const sessionRouter = Router();

sessionRouter.use(authMiddleware);

sessionRouter.get("", getAllSessionController);
sessionRouter.delete("/:sessionId", DeleteSessionById);
sessionRouter.delete("/all-except-current", DeleteAllSessionExceptCurrent);



export default sessionRouter;
