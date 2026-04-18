import { HttpStatus, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import { jwtVerify } from "./jwt";
import { CustomResponse } from "./responseHandler";

export class AuthMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: (error?: Error | any) => void) {
        const headers = req.headers?.authorization?.split(" ")[1]
        const token = jwtVerify(headers)
        if (token && token.is_admin) {
            return next()
        }
        throw new CustomResponse(HttpStatus.UNAUTHORIZED, "You're not allowed to access this route", null)
    }
}