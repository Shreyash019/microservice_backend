import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from "bcryptjs";

// Define the UserAccount interface to represent the structure of an admin account
type ProfilePicture = {
    public_id: string,
    url: string,
    filetype: string,
}
interface UserAccount extends Document {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    name: String
    profilePicture: ProfilePicture
}

const UserAccountSchema: Schema = new Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            select:false
        },
        name: {
            type: String,
            required: true,
        },
        profilePicture: {type: Object, default:{
            public_id: "demo",
            url: "https://www.pngkey.com/png/full/72-729716_user-avatar-png-graphic-free-download-icon.png",
            filetype: "image"
        }}
    },
    {
        timestamps: true
    }
)

UserAccountSchema.pre("save", async function (this: UserAccount, next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

UserAccountSchema.methods.correctPassword = async function (candidatePassword: string) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the AdminAccount model based on the schema
const UserAccountModel = mongoose.model<UserAccount>('UserAccount', UserAccountSchema);

export default UserAccountModel;