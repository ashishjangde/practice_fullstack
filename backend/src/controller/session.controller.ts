import { ApiError } from "../advices/ApiError";
import { ApiResponse } from "../advices/ApiResponse";
import { prisma } from "../db/connectDb";
import { SessionRepository } from "../repositories/session.repositories";
import asyncHandler from "../utils/asyncHandler";
import status from "http-status";


export const getAllSessionController = asyncHandler(async (req ,res) => {
    if (!req.user) {
         throw new ApiError(status.UNAUTHORIZED , "User not authenticated")
    }
    const {id} = req.user;

    const allSessions = await SessionRepository.getSessionsByUserId(id)

    return res.status(status.OK).json(new ApiResponse({
        sessions : allSessions,
        message : "All session Retrived"
    }))
})

export const DeleteSessionById =asyncHandler(async (req ,res) => {
    if (!req.user) {
         throw new ApiError(status.UNAUTHORIZED , "User not authenticated")
    }
    const {sessionId} = req.params;

    if(!sessionId){
        throw new ApiError(status.BAD_REQUEST , "Session Id cant be empty")
    }

    const deleted  = await SessionRepository.deleteSessionById(sessionId)

    if(!deleted){
         throw new ApiError(status.BAD_REQUEST , "Requested Session Doesnt Exist");
    }

    return res.json(new ApiResponse({
        message : "Session successfully deleted"
    }))

});

export const DeleteAllSessionExceptCurrent = asyncHandler(async (req ,res) => {
    if (!req.user) {
         throw new ApiError(status.UNAUTHORIZED , "User not authenticated")
    }

    const refresh_token = req.cookies.refreshToken;

     await prisma.sessions.deleteMany({
        where: {
            token: {
                not: refresh_token
            }
        }
    });

    return res.json(new ApiResponse({
        message : "Sessions successfully deleted"
    }))

});