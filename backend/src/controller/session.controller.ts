import { ApiResponse } from "../advices/ApiResponse";
import { SessionRepository } from "../repositories/session.repositories";
import asyncHandler from "../utils/asyncHandler";
import status from "http-status";


export const getAllSessionController = asyncHandler(async (req ,res) => {
    if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    console.log(req.user)
    
    const {id} = req.user;

    const allSessions = await SessionRepository.getSessionsByUserId(id)

    return res.status(status.OK).json(new ApiResponse({
        sessions : allSessions,
        message : "All session Retrived"
    }))
})