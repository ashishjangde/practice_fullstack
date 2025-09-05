import bcrypt from "bcryptjs";
import type { Users } from "../generated/prisma";
import jwt, { type JwtPayload } from 'jsonwebtoken'

export interface IAccessPayload {
    id : Users['id'],
    name : Users['name']
    email : Users['email']
    role : Users['role']
}

interface IRefreshPayload {
    id : Users['id']
}


const PasswordUtils = {
    generateHashpassoword : (password : string)=>{
        return bcrypt.hash(password,10)
    },
    comparePassword : (originalPassword : string , hashedPassword : string)=>{
        return bcrypt.compare(originalPassword , hashedPassword)
    }
}

const VerificationCodeGen = ()=>{
    return String(Math.floor(100000 + Math.random() * 900000))
}




const JwtUtils = {
    generateAccessToken: (data: IAccessPayload): string => {
        try {
            if (!process.env.ACCESS_TOKEN_SECRET) {
                throw new Error('ACCESS_TOKEN_SECRET is not defined in environment variables');
            }
            
            const access_token = jwt.sign(
                { data },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' } as any
            );
            return access_token;
        } catch (error) {
            console.error('JWT generation failed:', error);
            throw new Error('Token generation failed');
        }
    },

    generateRefreshToken: (data : IRefreshPayload): string => {
        try {
            if (!process.env.REFRESH_TOKEN_SECRET) {
                throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
            }
            
            const refresh_token = jwt.sign(
                { data },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' } as any
            );
            return refresh_token;
        } catch (error) {
            console.error('Refresh token generation failed:', error);
            throw new Error('Refresh token generation failed');
        }
    },

    verifyAccessToken: (access_token: string): IAccessPayload => {
        try {
            if (!process.env.ACCESS_TOKEN_SECRET) {
                throw new Error('ACCESS_TOKEN_SECRET is not defined in environment variables');
            }
            
            const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET) as JwtPayload;
            
            if (!decoded.data) {
                throw new Error('Invalid token payload');
            }
            
            return decoded.data as IAccessPayload;
        } catch (error) {
            console.error('Access token verification failed:', error);
            throw new Error('Invalid or expired access token');
        }
    },

    verifyRefreshToken: (refresh_token: string): IRefreshPayload => {
        try {
            if (!process.env.REFRESH_TOKEN_SECRET) {
                throw new Error('REFRESH_TOKEN_SECRET is not defined in environment variables');
            }
            
            const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET) as JwtPayload;
            
            if (!decoded.id) {
                throw new Error('Invalid refresh token payload');
            }
            
            return { id: decoded.id };
        } catch (error) {
            console.error('Refresh token verification failed:', error);
            throw new Error('Invalid or expired refresh token');
        }
    },
}


export {
    PasswordUtils,
    VerificationCodeGen,
    JwtUtils
}