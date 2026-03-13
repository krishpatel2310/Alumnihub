import mongoose from "mongoose";

// Sub-schemas for proper validation
const contactSchema = new mongoose.Schema({
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true }
}, { _id: false });

const educationSchema = new mongoose.Schema({
    school: { type: String, trim: true },
    degree: { type: String, trim: true },
    year: { type: String, trim: true }
}, { _id: false });

const experienceSchema = new mongoose.Schema({
    role: { type: String, trim: true },
    company: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    bullets: [{ type: String, trim: true }]
}, { _id: false });

const projectSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    tech: [{ type: String, trim: true }]
}, { _id: false });

const strengthSchema = new mongoose.Schema({
    title: { type: String, trim: true },
    detail: { type: String, trim: true }
}, { _id: false });

const languageSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    level: { type: String, trim: true }
}, { _id: false });

// Main content schema with proper structure validation
const contentSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    headline: { type: String, trim: true },
    summary: { type: String, trim: true },
    contact: contactSchema,
    skills: [{ type: String, trim: true }],
    strengths: [strengthSchema],
    languages: [languageSchema],
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema]
}, { _id: false });

// Answers schema for request storage
const answersSchema = new mongoose.Schema({
    fullName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true },
    headline: { type: String, trim: true },
    targetRole: { type: String, trim: true },
    summary: { type: String, trim: true },
    education: { type: String, trim: true },
    skills: { type: String, trim: true },
    strengths: { type: String, trim: true },
    languages: { type: String, trim: true },
    projects: { type: String, trim: true },
    experience: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    college: { type: String, trim: true },
    field: { type: String, trim: true }
}, { _id: false });

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
            enum: ["classic", "modern", "minimal", "creative", "tech"],
            required: true,
            index: true
        },
        answers: answersSchema,
        content: contentSchema,
        status: {
            type: String,
            enum: ["draft", "generated"],
            default: "draft",
            index: true
        }
    },
    { timestamps: true }
);

// Add index for queries by status and createdAt
resumeSchema.index({ user: 1, status: 1 });
resumeSchema.index({ createdAt: -1 });

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
