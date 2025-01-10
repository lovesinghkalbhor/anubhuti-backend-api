import { Request, Response, NextFunction } from "express";

// Define the type for the request handler
type RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const asyncHandler = (requestHandler: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(
        "4 here is in asynchandler\n llllllllllllllllllllll\n33333333333333333333333333\n333333333333333333333333333333\n33333333333333333 "
      );

      await requestHandler(req, res, next);
    } catch (err) {
      console.log(
        "5 here is \n llllllllllllllllllllll\n33333333333333333333333333\n333333333333333333333333333333\n33333333333333333 "
      );

      next(err);
    }
  };
};

export { asyncHandler };
