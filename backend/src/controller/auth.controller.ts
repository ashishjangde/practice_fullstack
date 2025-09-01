import { ApiError } from "../advices/ApiError";
import { ApiResponse } from "../advices/ApiResponse";
import { RegistrationSchema } from "../schema/auth.schema"
import asyncHandler from "../utils/asyncHandler"
import { zodErrorFormator } from "../utils/format-validation-erros";
import { type Users ,UserRole} from "../generated/prisma";
import { prisma } from "../db/connectDb";
import { PasswordUtils, VerificationCodegGen } from "../utils/auth-utils";

export const RegisterController = asyncHandler(async (req, res)=>{
  const result = RegistrationSchema.safeParse(req.body)
  if(!result.success){
        throw new ApiError(400 , "Validation Error" , zodErrorFormator(result.error))
  }
  const {name , email , password } = result.data;

   const savedUser = await prisma.users.findUnique({
    where: { email }
   });

   if(savedUser?.is_verified){
     throw new ApiError(409, `user already exist with this email : ${email}`)
   }

  let userToBeReturned : Users ;
  let verification_code = VerificationCodegGen();
  let hasshedPassword =  await PasswordUtils.generateHashpassoword(password);
  let statusCode:number;

  if(!savedUser){
  userToBeReturned = await prisma.users.create({
    data :{ 
      name,
      email,
      password : hasshedPassword,
      verification_code,
      role: [UserRole.USER]
    },
    
  });
  statusCode = 201
}else{
  userToBeReturned = await prisma.users.update({
    where: { email },
    data: {
      name,
      password: hasshedPassword,
      verification_code,
      role: [UserRole.USER]
    }
  });
  statusCode = 200
}


 const { password: _, verification_code: __, ...userWithoutSensitive } = userToBeReturned;


  return res.status(statusCode).json(
    new ApiResponse({
      user : userWithoutSensitive,
      message : "Account Successfully Registered"
    })
  )
})