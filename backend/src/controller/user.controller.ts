import status from "http-status";
import { ApiError } from "../advices/ApiError";
import asyncHandler from "../utils/asyncHandler";
import { UserRepository } from "../repositories/user.repositories";
import { sanitizeUser } from "./auth.controller";
import { ApiResponse } from "../advices/ApiResponse";
import { PasswordChangeSchema, UpdateUserSchema } from "../schema/user.schema";
import { zodErrorFormator } from "../utils/format-validation-erros";
import { PasswordUtils } from "../utils/auth-utils";

export const meController = asyncHandler(async (req , res) => {
     if (!req.user) {
         throw new ApiError(status.UNAUTHORIZED , "User not authenticated")
    }
    const {id} = req.user;

    const user = await UserRepository.getUserById(id)
    if(!user){
         throw new ApiError(status.UNAUTHORIZED , "User not authenticated")
    }

   const sanatizedUser  = sanitizeUser(user)

   res.status(status.OK).json(new ApiResponse({
    user : sanatizedUser
   }))
});

export const updateUserController = asyncHandler(async (req , res) => {
     if (!req.user) {
         throw new ApiError(status.UNAUTHORIZED , "User not authenticated")
    }
    const {id} = req.user;
    const result = UpdateUserSchema.safeParse(req.body)
       if (!result.success) {
         throw new ApiError(400, "Validation Error", zodErrorFormator(result.error))
       }
       
       const { name } = result.data;
     


    const user = await UserRepository.getUserById(id)
    if(!user){
         throw new ApiError(status.UNAUTHORIZED , "User not authenticated")
    }

    const updatedUser = await UserRepository.updateUserById(id , {
        name
    })


   const sanatizedUser  = sanitizeUser(updatedUser)

   res.status(status.OK).json(new ApiResponse({
    user : sanatizedUser
   }))
});


export const UpdatePasswordController = asyncHandler(async (req , res) => {
     if (!req.user) {
         throw new ApiError(status.UNAUTHORIZED , "User not authenticated")
    }
    const {id} = req.user;
    const result = PasswordChangeSchema.safeParse(req.body)
       if (!result.success) {
         throw new ApiError(400, "Validation Error", zodErrorFormator(result.error))
       }
       
       const { currrentPassword , newPassword } = result.data;

    const user = await UserRepository.getUserById(id)
    if(!user){
         throw new ApiError(status.UNAUTHORIZED , "User not authenticated")
    }

    const isPassValid = PasswordUtils.comparePassword(currrentPassword, user.password);

    if(!isPassValid){
         throw new ApiError(status.UNAUTHORIZED , "The Password isnt match with your current password try to reset")
    }

    const hashedPassword = await PasswordUtils.generateHashpassoword(newPassword)

    const updatedUser = await UserRepository.updateUserById(id , {
        password : hashedPassword 
    })


   const sanatizedUser  = sanitizeUser(updatedUser)

   res.status(status.OK).json(new ApiResponse({
    user : sanatizedUser
   }))
});
