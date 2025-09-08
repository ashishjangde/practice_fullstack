import { Router } from "express";
import { meController, updateUserController, UpdatePasswordController } from "../controller/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const userRouter = Router();

userRouter.use(authMiddleware);

userRouter.get("/me", meController);
userRouter.put("/update", updateUserController);
userRouter.put("/update-password", UpdatePasswordController);

export default userRouter;
