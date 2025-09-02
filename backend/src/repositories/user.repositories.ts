import { prisma } from "../db/connectDb";
import type { Prisma, Users  } from "../generated/prisma";

export const UserRepository = {
  createUser: async (data: Prisma.UsersCreateInput): Promise<Users> => {
    return prisma.users.create({ data });
  },

  getUserById: async (id: string): Promise<Users | null> => {
    return prisma.users.findUnique({ where: { id } });
  },

  getUserByEmail: async (email: string): Promise<Users | null> => {
    return prisma.users.findUnique({ where: { email } });
  },

  updateUserById: async (id: string, data: Prisma.UsersUpdateInput): Promise<Users> => {
    return prisma.users.update({ where: { id }, data });
  },

  deleteUserById: async (id: string): Promise<Users> => {
    
    return prisma.users.delete({ where: { id } });
  },
};
