import { Request} from "express";

type UserObject = {
    id: string
}

interface UserRequest extends Request {
    user?: UserObject;
}

type DecodedJwt = {
    id: string;
    // Add other properties expected from the JWT payload
  };

export { UserRequest, UserObject, DecodedJwt}