import type { Request, Response, NextFunction } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<Response | void>;

const asyncHandler = (fun : AsyncRequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fun(req, res, next))
            .catch(error =>next(error));
    };
}
export default asyncHandler;