import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return next();
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: VerifyErrors | null, payload: JwtPayload | string | undefined) => {
      if (!err && payload) {
        req.userId = (payload as JwtPayload).id;
      }
      next();
    }
  );
};