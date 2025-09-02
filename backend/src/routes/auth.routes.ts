import { Router } from "express";
import {
  RegisterController,
  VerifyUser,
  LoginController,
  ForgotPasswordController,
  CheckVerificationCodeController,
  ResetPassswordController,
  RefreshTokenController,
  LogoutController,
  ResendVerificationCodeController
} from "../controller/auth.controller";

const authRouter = Router();

authRouter.post("/register", RegisterController);
authRouter.post("/verify", VerifyUser);
authRouter.post("/resend-verification-code", ResendVerificationCodeController);
authRouter.post("/login", LoginController);
authRouter.post("/forgot-password", ForgotPasswordController);
authRouter.post("/check-verification-code", CheckVerificationCodeController);
authRouter.post("/reset-password", ResetPassswordController);
authRouter.post("/refresh-token", RefreshTokenController);
authRouter.post("/logout", LogoutController);

export default authRouter;
