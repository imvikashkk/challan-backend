import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { jwtVerify } from "./jwt";

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest()
        if (!request.headers.authorization) {
            return false
        }
        const token = jwtVerify(request.headers.authorization.split(" ")[1])
        if (token && token.is_admin) {
            return true
        }
        return false
    }
}