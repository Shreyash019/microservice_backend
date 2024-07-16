import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Response } from "express"
import { UserRequest } from "./interface_Types"
export default class Auth {
    constructor() { }
    async generateToken(id: string): Promise<string> {
        return jwt.sign({ id }, process.env.JWT_SECRET!, {
            expiresIn: process.env.JWT_EXPIRES_IN!,
        });
    }

    async headerAuthToken(res: Response, user: string,): Promise<{ success: boolean }> {
        // Token Generation
        const token = await this.generateToken(user);

        // Cookie validation days setup
        const options = {
            expires: new Date(
                Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN!) * 24 * 60 * 1000
            ),
            httpOnly: true,
        };

        // Token setting in header
        res.cookie("user_token", token, options);

        // Return values
        return { success: true };
    }

    async userAuthorization(req: UserRequest, res: Response, next: NextFunction): Promise<void | object> {
        const auth = new Auth();
        // Fetching token
        let token: string | undefined = undefined;
        if (req.cookies.user_token) {
            token = req.cookies.user_token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            const authHeader = req.headers.authorization.split(" ");
            if (authHeader.length === 2 && authHeader[1].toLowerCase() !== "null") {
                token = authHeader[1];
            }
        }

        // Returning if no token
        if (!token) {
            return res.status(401).json({
                success: false,
                message: `Please login.`,
            });
        }

        // Decoding user using token
        type DecodedJwt = {
            exp: number; // Assuming expiration is stored in 'exp' claim
            id: string;
            iat: number
        };
        const decoded = await jwt.verify(token, process.env.JWT_SECRET!) as DecodedJwt;;

        const currentTime = Math.floor(Date.now() / 1000);
        const issuedAt = decoded.iat;
        const TIME_FOR_REFRESH = 300 // In Seconds
        const timeDifference = currentTime - issuedAt;
        
        if (timeDifference > TIME_FOR_REFRESH) {
            await auth.headerAuthToken(res, decoded.id);
        }
        if (typeof decoded === 'string') {
            res.status(401).json({ success: false, message: 'Please login again.' });
        } else {
            req.user = {
                id: decoded.id,
            }
        }
        next()
    }

}