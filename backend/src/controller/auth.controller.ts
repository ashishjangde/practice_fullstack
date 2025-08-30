import { ApiError } from "../advices/ApiError";
import { ApiResponse } from "../advices/ApiResponse";
import { RegistrationSchema } from "../schema/auth.schema"
import asyncHandler from "../utils/asyncHandler"
import { zodErrorFormator } from "../utils/format-validation-erros";
import type { Users ,UserRole} from "../generated/prisma";

export const RegisterController = asyncHandler(async (req, res)=>{
  const result = RegistrationSchema.safeParse(req.body)
  if(!result.success){
        throw new ApiError(400 , "Validation Error" , zodErrorFormator(result.error))
  }
  
  // Process the valid data here
  const validData = result.data;
  
  return res.json(
    new ApiResponse(validData)
  )
})