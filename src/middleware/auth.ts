import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../types";
import sendResponse from "../utility/sendResponse";
import { jwtHelper } from "../utility/jwt";
import config from "../config";
import type { JwtPayload } from "jsonwebtoken";
import { pool } from "../db";


const auth = (...roles: UserRole[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;

      if(!token){
        return sendResponse(res,{
            statusCode: 401,
            success: false,
            message: "Unauthorized access"
        })
        
      }
      const decoded = jwtHelper.verifyToken(
        token as string,
        config.secret as string,
      ) as JwtPayload;

      const userData = await pool.query(`
         SELECT * FROM users WHERE email = $1
        `,
        [decoded.email]);
    // const user = userData.rows[0];

    if (userData.rows.length === 0) {
        throw new Error("User not found!");
      }
    if (roles.length && !roles.includes(decoded.role)) {
        throw new Error("Forbidden");
     }
     req.user = decoded;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;