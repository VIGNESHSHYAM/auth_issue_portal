"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Placement Issue Schema
const placementIssueSchema = new mongoose_1.default.Schema({
    issueId: { type: mongoose_1.default.Schema.Types.ObjectId, default: mongoose_1.default.Types.ObjectId },
    issue: { type: String, required: true },
    status: { type: String, default: 'pending' }, // Optional: Track status of the issue
    comments: { type: [String], default: [] }, // Optional: Track admin comments
});
// User Schema
const userSchema = new mongoose_1.default.Schema({
    registrationNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    facultyName: { type: String, required: true },
    semester: { type: String, required: true },
    emailId: { type: String, required: true },
    department: { type: String, required: true },
    UG_OR_PG: { type: String, required: true },
    mobile_number: { type: Number, required: true },
    Gender: { type: String, required: true },
    DOB: { type: String, required: true },
    Specialization: { type: String, required: true },
    SRMIST_Mail_ID: { type: String, required: true },
    alternate_number: { type: Number, required: true },
    Section: { type: String, required: true },
    placementIssues: { type: [placementIssueSchema], default: [] }, // Array of placement issues
});
// Admin Schema
const adminSchema = new mongoose_1.default.Schema({
    registrationNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' }, // Defining admin role
});
// Models
exports.User = mongoose_1.default.model('User', userSchema);
exports.Admin = mongoose_1.default.model('Admin', adminSchema);
