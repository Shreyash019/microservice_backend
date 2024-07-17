import express from 'express';
import AuthenticationController from "./UserController";
import UserAuthentication from "../authUtils";

const UserController = new AuthenticationController();
const authentication = new UserAuthentication();
const router = express.Router();

// Sign Up
router.route("/sign-up").post(UserController.userSignUp);
router.route("/sign-in").post(UserController.userSignIn);
router.route("/sign-out").get(UserController.userSignOut);
router.route("/profile").get(authentication.userAuthorization, UserController.userProfile);
router.post("/refresh-token", async (req, res)=>{
    if(!req.body?.refreshToken){
        return res.status(400).json({message: "Refresh Token is required."})
    }
    const random = Math.random() * 10
    let data = await authentication.generateRefreshToken(req.body.refreshToken)
    if(random < 3 || !data.success){
        return res.status(200).json({
            success: false,
            message: !data.success ? 'Account not exist' : 'You account is blocked!',
            isActive: false,
        })
    }
    
    res.status(200).json({
        success: true,
        message: `Yeah`,
        isActive: true,
        refreshedToken: data
    })
})


export default router;