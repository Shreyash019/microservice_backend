import jwt from "jsonwebtoken";
import axios from "axios"
import { NextFunction, Response } from "express"
import { UserRequest } from "./interface_Types"


export default class Auth {
    constructor() { }

    async userAuthorization(req: UserRequest, res: Response, next: NextFunction): Promise<void | object> {
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
            return res.status(401).json({ success: false, message: "Unauthorized" })
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
            let newData: any;
            await axios.post('http://todo_user_service:5001/user/refresh-token', { refreshToken: token })
                .then((response) => {
                    newData = response.data
                })
                .catch((err) => {
                    console.log(err.toString())
                    return res.status(401).json({ success: false, message: "Yo Yo Unauthorized Access" })
                })
            if (!newData.isActive) {
                return res.status(401).json({ success: false, message: newData.message  })
            }
            // Token setting in header
            const options = {
                expires: new Date(
                    Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN!) * 24 * 60 * 1000
                ),
                httpOnly: true,
            };
            res.cookie("user_token", newData.refreshedToken.token, options);
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