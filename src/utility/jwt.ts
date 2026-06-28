import jwt, {type JwtPayload, type Secret, type SignOptions } from "jsonwebtoken";

export const jwtHelper = {
  generateToken<T extends object>(
    payload: T,
    secret: Secret,
    options?: SignOptions
  ) {
    return jwt.sign(payload, secret, options);
  },

  verifyToken<T extends JwtPayload>(
    token: string,
    secret: Secret
  ) {
    return jwt.verify(token, secret) as T;
  },
};