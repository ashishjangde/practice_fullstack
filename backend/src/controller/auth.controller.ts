import { ApiResponse } from "../advices/ApiResponse";
import { RegistrationSchema } from "../schema/auth.schema"
import asyncHandler from "../utils/asyncHandler"

export const RegisterController = asyncHandler(async (req, res)=>{
  const result = RegistrationSchema.safeParse(req.body)
  if(!result.success){
        console.log(result.error)
        return res.json(
            new ApiResponse(JSON.parse(result.error))
        )
        // throw new ApiError(400, "Validation Error", result.error);
  }
  return res.json(
    new ApiResponse(result)
  )
})