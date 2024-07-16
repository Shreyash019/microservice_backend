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


export default router;