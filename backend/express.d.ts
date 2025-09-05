import type { Users } from "./src/generated/prisma";
import type {IAccessPayload} from "./src/utils/auth-utils"

declare global {
  namespace Express {
    interface Request {
      user?: IAccessPayload
    }
  }
}
