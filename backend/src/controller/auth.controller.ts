import { ApiError } from "../advices/ApiError";
import { ApiResponse } from "../advices/ApiResponse";
import { CheckVerificationCodeSchema, ForgotPasswordSchema, LoginSchema, RegistrationSchema, ResetPasswordSchema, ResendVerificationCodeSchema, VerifySchema } from "../schema/auth.schema"
import asyncHandler from "../utils/asyncHandler"
import { zodErrorFormator } from "../utils/format-validation-erros";
import { type Users, UserRole } from "../generated/prisma";
import { PasswordUtils, VerificationCodeGen, JwtUtils } from "../utils/auth-utils";
import { UserRepository } from "../repositories/user.repositories";
import { SessionRepository } from "../repositories/session.repositories";

// Helper function to sanitize user data
const sanitizeUser = (user: Users) => {
  const { password: _, verification_code: __, verification_code_expiry: ___, ...userWithoutSensitive } = user;
  return userWithoutSensitive;
};

// Helper function to handle successful authentication
const handleAuthSuccess = async (user: Users, req: any, res: any) => {
  const accessToken = JwtUtils.generateAccessToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });

  const refreshToken = JwtUtils.generateRefreshToken({ id: user.id });

  await SessionRepository.createSession({
    token: refreshToken,
    ip_address: req.ip || "",
    user_agent: req.headers['user-agent'] || "",
    expire_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    user: {
      connect: { id: user.id }
    }
  });

  const userWithoutSensitive = sanitizeUser(user);

  res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    })
    .json(
      new ApiResponse({
        user: userWithoutSensitive,
        access_token: accessToken,
        message: "Authentication successful"
      })
    );
};

export const RegisterController = asyncHandler(async (req, res) => {
  const result = RegistrationSchema.safeParse(req.body)
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormator(result.error))
  }
  const { name, email, password } = result.data;

  const savedUser = await UserRepository.getUserByEmail(email)

  if (savedUser?.is_verified) {
    throw new ApiError(409, `user already exist with this email : ${email}`)
  }

  let userToBeReturned: Users;
  let verification_code = VerificationCodeGen();
  let hashedPassword = await PasswordUtils.generateHashpassoword(password);
  let statusCode: number;

  if (!savedUser) {
     userToBeReturned = await UserRepository.createUser({
      name,
      email,
      password: hashedPassword,
      verification_code,
      verification_code_expiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      role: [UserRole.USER]
     })
    statusCode = 201
  } else {
    userToBeReturned = await UserRepository.updateUserById(savedUser.id ,{
        name,
        password: hashedPassword,
        verification_code,
        verification_code_expiry: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        role: [UserRole.USER]
    });
    statusCode = 200
  }


  const { password: _, verification_code: __, verification_code_expiry: ___, ...userWithoutSensitive } = userToBeReturned;


  return res.status(statusCode).json(
    new ApiResponse({
      user: userWithoutSensitive,
      message: "Account Successfully Registered"
    })
  )
});




export const VerifyUser = asyncHandler(async (req, res) => {
  const result = VerifySchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormator(result.error))
  };

  const { email, verification_code } = result.data;

  const existingUser = await UserRepository.getUserByEmail(email)

  if (!existingUser) {
    throw new ApiError(409, "User not exist with this email ")
  }

  if (existingUser.verification_code != verification_code) {
    throw new ApiError(400, "Invalid Verification Code")
  }
  if (
    !existingUser.verification_code_expiry ||
    existingUser.verification_code_expiry.getTime() < Date.now()
  ) {
    throw new ApiError(400, "Verification code is expired")
  }


  const userToBeReturned = await UserRepository.updateUserById(existingUser.id , {
      is_verified: true,
      verification_code: null,
      verification_code_expiry: null
  })

  // Handle authentication success
  await handleAuthSuccess(userToBeReturned, req, res);
})


export const LoginController = asyncHandler(async (req, res) => {
    const result = LoginSchema.safeParse(req.body);
    if(!result.success){
      throw new ApiError(400 , "Validation Error" , zodErrorFormator(result.error))
    };

    const {email , password} = result.data;

    const existingUser = await UserRepository.getUserByEmail(email)

    if(!existingUser || !existingUser.is_verified){
      throw new ApiError(400 , "User with this email not exist or Verfied")
    }

    const isPassValid = PasswordUtils.comparePassword(password , existingUser.password)
    if(!isPassValid){
       throw new ApiError(400 , "Inavlid Credential")
    };

    // Handle authentication success
    await handleAuthSuccess(existingUser, req, res);

});


export const ForgotPasswordController = asyncHandler(async (req, res) => {
    const result = ForgotPasswordSchema.safeParse(req.body);
    if(!result.success){
      throw new ApiError(400 , "Validation Error" , zodErrorFormator(result.error))
    };

    const {email} = result.data;

    const existingUser = await UserRepository.getUserByEmail(email)

    if(!existingUser || !existingUser.is_verified){
      throw new ApiError(400 , "User with this email not exist or Verfied")
    }

    const  verification_code = VerificationCodeGen();

    await UserRepository.updateUserById(existingUser.id , {
      verification_code,
      verification_code_expiry : new Date(Date.now() + 10 * 60 * 1000)
    });
    //TODO: implement mail functionality
        return res.json(new ApiResponse({
          message : "Forgot passowod mail has been sent to your email"
        }))
});



export const ResendVerificationCodeController = asyncHandler(async (req, res) => {
  const result = ResendVerificationCodeSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormator(result.error))
  };

  const { email } = result.data;

  const existingUser = await UserRepository.getUserByEmail(email)

  if (!existingUser) {
    throw new ApiError(409, "User not exist with this email")
  }

  if (existingUser.is_verified) {
    throw new ApiError(400, "User is already verified")
  }

  const verification_code = VerificationCodeGen();

  await UserRepository.updateUserById(existingUser.id, {
    verification_code,
    verification_code_expiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  });

  // TODO: implement mail functionality to send the new verification code

  return res.status(200).json(
    new ApiResponse({
      message: "Verification code resent successfully"
    })
  );
});

export const CheckVerificationCodeController = asyncHandler(async (req, res) => {
  const result = CheckVerificationCodeSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormator(result.error))
  };

  const { email, verification_code } = result.data;

  const existingUser = await UserRepository.getUserByEmail(email)

  if (!existingUser) {
    throw new ApiError(409, "User not exist with this email ")
  }

  if (existingUser.verification_code != verification_code) {
    throw new ApiError(400, "Invalid Verification Code")
  }
  if (
    !existingUser.verification_code_expiry ||
    existingUser.verification_code_expiry.getTime() < Date.now()
  ) {
    throw new ApiError(400, "Verification code is expired")
  }

  return res.status(200).json(
    new ApiResponse({
      message: "Verification code is valid"
    })
  );
});


export const ResetPassswordController = asyncHandler(async (req, res) => {
  const result = ResetPasswordSchema.safeParse(req.body);
  if (!result.success) {
    throw new ApiError(400, "Validation Error", zodErrorFormator(result.error))
  };

  const { email, verification_code, password } = result.data;

  const existingUser = await UserRepository.getUserByEmail(email)

  if (!existingUser) {
    throw new ApiError(409, "User not exist with this email ")
  }

  if (existingUser.verification_code != verification_code) {
    throw new ApiError(400, "Invalid Verification Code")
  }
  if (
    !existingUser.verification_code_expiry ||
    existingUser.verification_code_expiry.getTime() < Date.now()
  ) {
    throw new ApiError(400, "Verification code is expired")
  }

  const hashedPassword = await PasswordUtils.generateHashpassoword(password);

  await UserRepository.updateUserById(existingUser.id, {
    password: hashedPassword,
    verification_code: null,
    verification_code_expiry: null
  });

  return res.status(200).json(
    new ApiResponse({
      message: "Password reset successfully"
    })
  );
});

export const RefreshTokenController = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token not provided");
  }

  const decoded = JwtUtils.verifyRefreshToken(refreshToken);

  const session = await SessionRepository.getSessionByToken(refreshToken);
  if (!session || session.expire_at.getTime() < Date.now()) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await UserRepository.getUserById(decoded.id);
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const accessToken = JwtUtils.generateAccessToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });

  res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    })
    .json(
      new ApiResponse({
        access_token: accessToken,
        message: "Access token refreshed"
      })
    );
});


export const LogoutController = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    const session = await SessionRepository.getSessionByToken(refreshToken);
    if (session) {
      await SessionRepository.deleteSessionById(session.id);
    }
  }

  res
    .status(200)
    .clearCookie("accessToken", { path: "/" })
    .clearCookie("refreshToken", { path: "/" })
    .json(
      new ApiResponse({
        message: "Logged out successfully"
      })
    );
});

