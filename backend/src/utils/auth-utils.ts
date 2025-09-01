import bcrypt from "bcryptjs";


const PasswordUtils = {
    generateHashpassoword : (password : string)=>{
        return bcrypt.hash(password,10)
    },
    comparePassword : (orignalPassoword : string , hashedPassword : string)=>{
        return bcrypt.compare(orignalPassoword , hashedPassword)
    }
}

const VerificationCodegGen = ()=>{
    return String(Math.floor(100000 + Math.random() * 900000))
}


export {
    PasswordUtils,
    VerificationCodegGen,
}