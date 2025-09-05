import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../advices/ApiError";
import status from "http-status";
import { JwtUtils } from "../utils/auth-utils";

// extend Express Request type to include "user"


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const bearerHeader = req.headers.authorization;

    let bearerToken: string | undefined;

    if (bearerHeader && bearerHeader.startsWith("Bearer ")) {
      bearerToken = bearerHeader.split(" ")[1];
    }

    if (!accessToken && !bearerToken) {
      throw new ApiError(status.UNAUTHORIZED, "Token not provided");
    }

    const parsedToken = accessToken || bearerToken;

    const decoded = JwtUtils.verifyAccessToken(parsedToken!);

    req.user = decoded;

    next();
  } catch (err) {
    next(new ApiError(status.UNAUTHORIZED, "Invalid or expired token"));
  }
};
