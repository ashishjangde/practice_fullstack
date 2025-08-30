import type {Request , Response , NextFunction} from "express"
import { ApiError } from "../advices/ApiError"
import { ApiResponse } from "../advices/ApiResponse"

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof ApiError){
        res.status(err.status_code).json(new ApiResponse(null, err))
    }else{
        console.error("Unhandled error:", err);
        res.status(500).json(new ApiResponse(null, new ApiError(500, "Internal Server Error")))
    }
}