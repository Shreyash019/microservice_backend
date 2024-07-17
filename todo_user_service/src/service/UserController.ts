import mongoose from "mongoose";
import { Response, NextFunction } from "express";
import { UserRequest } from "../interface_Types";
import UserAccountModel from "./UserAccount";
import UserAuthorization from "../authUtils";

const authentication = new UserAuthorization()

export default class UserAccountController {
    constructor() { }

    async userSignUp(req: UserRequest, res: Response, next: NextFunction) {
        try {
            // Checking request body
            const { username, password, email, name } = req.body;
            if (!username || !password || !email || !name) {
                return res.status(400).json({ message: "Please provide all the required fields" });
            }

            // Checking if the user already exists
            const existingUser = await UserAccountModel.findOne({
                $or: [
                    { username: { $regex: new RegExp(`^${username}$`, "i") } },
                    { email: { $regex: new RegExp(`^${email}$`, "i") } }
                ]
            });
            if (existingUser) {
                const duplicateField = existingUser.username.toLowerCase() === username.toLowerCase() ? 'username' : 'email';
                const errorMessage = `An account with the same ${duplicateField} already exists.`;
                return res.status(409).json({
                    success: false,
                    message: errorMessage
                })
            }

            const user: any = await UserAccountModel.create({
                username: req.body.username.trim(),
                email: req.body.email.trim(),
                name: req.body.name.trim(),
                password: req.body.password.trim(),
            })

            // Setting token cookies
            await authentication.headerAuthToken(res, user?._id);

            // Sending Success response
            res.status(200).json({
                success: true,
                message: "Account created successfully",
            })
        } catch (err: any) {
            // Sending error response
            return res.status(400).json({
                success: false,
                message: err.toString()
            })
        }
    }
    async userSignIn(req: UserRequest, res: Response, next: NextFunction) {
        try {

            // Checking request body
            const { password, email } = req.body;
            if (!password || !email) {
                return res.status(400).json({ message: "Please provide all the required fields" });
            }

            const user: any = await UserAccountModel.findOne({ email: req.body.email }).select("+password")
            if (!user || !(await user.correctPassword(req.body.password, user.password))) {
                return res.status(401).json({
                    success: false,
                    message: `Invalid credentials`
                })
            }
            const loginToken = await authentication.headerAuthToken(res, user?._id);
            if (!loginToken) {
                return res.status(401).json({
                    success: false,
                    message: `Invalid credentials`
                })
            }
            res.status(200).json({
                success: true,
                message: "Login successfully"
            })
        } catch (err) {
            next(err);
        }
    }
    async userSignOut(req: UserRequest, res: Response, next: NextFunction) {
        try {
            // Clear the cookie by setting its expiration date to the past
            res.clearCookie('user_token');
            res.status(200).json({
                success: true,
                message: "Sign out"
            })
        } catch (err) {
            next(err);
        }
    }
    async userProfile(req: UserRequest, res: Response, next: NextFunction) {
        try {
            const userID = req?.user?.id
            if (!mongoose.isValidObjectId(userID)) {
                return res.status(500).json({
                    success: false,
                    message: `Something went wrong`
                })
            }
            const user: any = await UserAccountModel.findById({ _id: userID })
                .select("username email name profilePicture")
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: `User not found`
                })
            }
            res.status(200).json({
                success: true,
                message: "User Profile",
                profile: user
            })
        } catch (err: any) {
            return res.status(500).json({
                success: false,
                message: err.message.toString()
            })
        }
    }
}