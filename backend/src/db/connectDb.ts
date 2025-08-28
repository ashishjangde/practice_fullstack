import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();


const connectDb = () =>{
    return new Promise<void>((resolve , reject)=>{
        prisma.$connect()
        .then(()=>{
            console.log("database connecte successfully")
            resolve();
        }).catch((error)=>{
            prisma.$disconnect();
            console.error('Failed to connect to the database:', error);
            console.log(error)
            reject()
        })
    })
}

const gracefulShutdown = async () => {
  console.log('Disconnecting Prisma Client...');
  await prisma.$disconnect();
  console.log('Prisma Client disconnected.');
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);


export { prisma, connectDb };