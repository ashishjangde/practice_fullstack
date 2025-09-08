import { prisma } from "../db/connectDb";
import type { Prisma, Sessions } from "../generated/prisma";

export const SessionRepository = {
  createSession: async (data: Prisma.SessionsCreateInput): Promise<Sessions> => {
    return prisma.sessions.create({ data });
  },

  getSessionById: async (id: string): Promise<Sessions | null> => {
    return prisma.sessions.findUnique({ where: { id } });
  },

  getSessionByToken: async (token: string): Promise<Sessions | null> => {
    return prisma.sessions.findUnique({ where: { token } });
  },

  getSessionsByUserId: async (userId: string): Promise<Sessions[]> => {
    return prisma.sessions.findMany({ where: { user_id: userId } });
  },

  updateSessionById: async (id: string, data: Prisma.SessionsUpdateInput): Promise<Sessions> => {
    return prisma.sessions.update({ where: { id }, data });
  },

  deleteSessionById: async (id: string): Promise<boolean> => {
    try {
      await prisma.sessions.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  },
};