import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
            unique: true
        },
        templateId: {
            type: String,
            required: true,
            trim: true
        },
        answers: {
            type: Object,
            default: {}
        },
        content: {
            type: Object,
            default: {}
        },
        status: {
            type: String,
            enum: ["draft", "generated"],
            default: "draft"
        }
    },
    { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
