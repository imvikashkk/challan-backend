import * as JWT from "jsonwebtoken";
import { User } from "src/user/user.entity";
interface JWTUserPayload {
    id: number;
    is_admin: boolean
}
export function jwtSign(data: JWTUserPayload): string {
    return JWT.sign(data, process.env.JWT_SECRET, { expiresIn: "3d" })
}
export function jwtVerify(token: string): User | false {
    try {
        return JWT.verify(token, process.env.JWT_SECRET) as User
    } catch (error) {
        console.log(error.message)
        return false
    }
}