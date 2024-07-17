import mongoose, { Schema, Document } from 'mongoose';

interface UserAccount extends Document {
    user: string
    taskName: string
    description: string
    completed: boolean
}

const TaskSchema: Schema = new Schema(
    {
        user: {
            type: String,
            required: true,
        },
        taskName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        completed: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true
    }
)

// Create and export the AdminAccount model based on the schema
const TasksModel = mongoose.model<UserAccount>('Tasks', TaskSchema);

export default TasksModel;