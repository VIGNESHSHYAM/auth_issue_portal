"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRouter = void 0;
const server_1 = require("@trpc/server");
const zod_1 = require("zod");
const trpc_1 = require("./trpc");
const auth_1 = require("./auth");
const usermodel_1 = require("./usermodel");
const RegisterUserSchema = zod_1.z.object({
    registrationNumber: zod_1.z.string(),
    password: zod_1.z.string(),
    name: zod_1.z.string(),
    facultyName: zod_1.z.string(),
    semester: zod_1.z.string(),
    emailId: zod_1.z.string().email(),
    department: zod_1.z.string(),
    UG_OR_PG: zod_1.z.string(),
    mobile_number: zod_1.z.number(),
    Gender: zod_1.z.string(),
    DOB: zod_1.z.string(),
    Specialization: zod_1.z.string(),
    SRMIST_Mail_ID: zod_1.z.string().email(),
    alternate_number: zod_1.z.number(),
    Section: zod_1.z.string(),
});
const AdminRegisterSchema = zod_1.z.object({
    registrationNumber: zod_1.z.string(),
    password: zod_1.z.string(),
    role: zod_1.z.string().default('admin'),
});
const LoginSchema = zod_1.z.object({
    registrationNumber: zod_1.z.string(),
    password: zod_1.z.string(),
});
const GetUserDetailsInputSchema = zod_1.z.object({
    registrationNumber: zod_1.z.string(),
});
const PostPlacementIssueSchema = zod_1.z.object({
    issue: zod_1.z.string(),
});
exports.appRouter = (0, trpc_1.router)({
    // User Registration
    registerUser: trpc_1.procedure
        .input(RegisterUserSchema)
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        const { registrationNumber, password } = input;
        const existingUser = yield usermodel_1.User.findOne({ registrationNumber });
        if (existingUser) {
            throw new server_1.TRPCError({ code: 'CONFLICT', message: 'User already exists' });
        }
        const hashedPassword = yield (0, auth_1.hashPassword)(password);
        const user = new usermodel_1.User(Object.assign(Object.assign({}, input), { password: hashedPassword }));
        yield user.save();
        return { success: true };
    })),
    // Admin Registration
    registerAdmin: trpc_1.procedure
        .input(AdminRegisterSchema)
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input }) {
        const { registrationNumber, password } = input;
        const existingAdmin = yield usermodel_1.Admin.findOne({ registrationNumber });
        if (existingAdmin) {
            throw new server_1.TRPCError({ code: 'CONFLICT', message: 'Admin already exists' });
        }
        const hashedPassword = yield (0, auth_1.hashPassword)(password);
        const admin = new usermodel_1.Admin({ registrationNumber, password: hashedPassword });
        yield admin.save();
        return { success: true };
    })),
    login: trpc_1.procedure
        .input(LoginSchema)
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input, ctx }) {
        const { registrationNumber, password } = input;
        const user = (yield usermodel_1.User.findOne({ registrationNumber })) || (yield usermodel_1.Admin.findOne({ registrationNumber }));
        if (!user) {
            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'User/Admin not found' });
        }
        const isPasswordValid = yield (0, auth_1.verifyPassword)(password, user.password);
        if (!isPasswordValid) {
            throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid password' });
        }
        const role = user instanceof usermodel_1.Admin ? 'admin' : 'user';
        const token = (0, auth_1.createJWT)(user.registrationNumber, role);
        ctx.session = ctx.session || {}; // Ensure session is initialized
        ctx.session.userDetails = { registrationNumber: user.registrationNumber, role };
        return { token, role };
    })),
    // Admin Login procedure
    adminLogin: trpc_1.procedure
        .input(LoginSchema)
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input, ctx }) {
        const { registrationNumber, password } = input;
        const admin = yield usermodel_1.Admin.findOne({ registrationNumber });
        if (!admin) {
            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Admin not found' });
        }
        const isPasswordValid = yield (0, auth_1.verifyPassword)(password, admin.password);
        if (!isPasswordValid) {
            throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid password' });
        }
        const token = (0, auth_1.createJWT)(admin.registrationNumber, 'admin');
        ctx.session = ctx.session || {}; // Ensure session is initialized
        ctx.session.userDetails = { registrationNumber: admin.registrationNumber, role: 'admin' };
        return { token, role: 'admin' };
    })),
    // Admin: Read all placement issues
    readPlacementIssues: trpc_1.procedure
        .use(auth_1.authMiddleware)
        .query((_a) => __awaiter(void 0, [_a], void 0, function* ({ ctx }) {
        var _b, _c;
        if (((_c = (_b = ctx.session) === null || _b === void 0 ? void 0 : _b.userDetails) === null || _c === void 0 ? void 0 : _c.role) !== 'admin') {
            throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'Admin access required' });
        }
        // Fetch all users that have placement issues
        const usersWithIssues = yield usermodel_1.User.find({ "placementIssues.0": { $exists: true } });
        // Iterate through each user and collect their placement issues
        const allIssues = usersWithIssues.flatMap(user => user.placementIssues.map(issue => ({
            registrationNumber: user.registrationNumber,
            name: user.name,
            issue: issue.issue,
            status: issue.status,
            comments: issue.comments,
            issueId: issue._id
        })));
        return allIssues;
    })),
    // Admin: Comment on a placement issue
    commentOnIssue: trpc_1.procedure
        .use(auth_1.authMiddleware)
        .input(zod_1.z.object({ registrationNumber: zod_1.z.string(), issueId: zod_1.z.string(), comment: zod_1.z.string() }))
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input, ctx }) {
        var _b, _c;
        if (((_c = (_b = ctx.session) === null || _b === void 0 ? void 0 : _b.userDetails) === null || _c === void 0 ? void 0 : _c.role) !== 'admin') {
            throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'Admin access required' });
        }
        const user = yield usermodel_1.User.findOne({ registrationNumber: input.registrationNumber });
        if (!user) {
            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }
        const issue = user.placementIssues.id(input.issueId);
        if (!issue) {
            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Issue not found' });
        }
        issue.comments.push(`Admin Comment: ${input.comment}`);
        yield user.save();
        return { success: true };
    })),
    readOwnPlacementIssues: trpc_1.procedure
        .use(auth_1.authMiddleware) // Token is decoded in authMiddleware
        .query((_a) => __awaiter(void 0, [_a], void 0, function* ({ ctx }) {
        var _b, _c;
        const registrationNumber = (_c = (_b = ctx.session) === null || _b === void 0 ? void 0 : _b.userDetails) === null || _c === void 0 ? void 0 : _c.registrationNumber; // Extract registrationNumber from token
        if (!registrationNumber) {
            throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' });
        }
        // Fetch the logged-in user's placement issues by their registrationNumber
        const user = yield usermodel_1.User.findOne({ registrationNumber, "placementIssues.0": { $exists: true } });
        if (!user) {
            return [];
        }
        // Collect the user's placement issues
        const userIssues = user.placementIssues.map(issue => ({
            registrationNumber: user.registrationNumber,
            name: user.name,
            issue: issue.issue,
            status: issue.status,
            comments: issue.comments,
            issueId: issue._id
        }));
        return userIssues;
    })),
    // User router
    getUserDetails: trpc_1.procedure
        .use(auth_1.authMiddleware) // Ensure user is authenticated
        .input(GetUserDetailsInputSchema)
        .query((_a) => __awaiter(void 0, [_a], void 0, function* ({ input, ctx }) {
        var _b;
        if (!((_b = ctx.session) === null || _b === void 0 ? void 0 : _b.userDetails)) {
            throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in' });
        }
        const user = yield usermodel_1.User.findOne({ registrationNumber: input.registrationNumber });
        if (!user) {
            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }
        return {
            registrationNumber: user.registrationNumber,
            name: user.name,
            emailId: user.emailId,
            facultyName: user.facultyName,
            semester: user.semester,
            department: user.department,
            UG_OR_PG: user.UG_OR_PG,
            mobile_number: user.mobile_number,
            Gender: user.Gender,
            DOB: user.DOB,
            Specialization: user.Specialization,
            SRMIST_Mail_ID: user.SRMIST_Mail_ID,
            alternate_number: user.alternate_number,
            Section: user.Section,
            placementIssue: user.placementIssues,
        };
    })),
    postPlacementIssue: trpc_1.procedure
        .use(auth_1.authMiddleware)
        .input(PostPlacementIssueSchema)
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input, ctx }) {
        var _b;
        if (!((_b = ctx.session) === null || _b === void 0 ? void 0 : _b.userDetails)) {
            throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in' });
        }
        const { registrationNumber } = ctx.session.userDetails;
        const user = yield usermodel_1.User.findOne({ registrationNumber });
        if (!user) {
            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }
        user.placementIssues.push({ issue: input.issue });
        yield user.save();
        return { success: true };
    })),
    // Admin: Change the status of a placement issue to 'pending' or 'reviewed'
    statusChange: trpc_1.procedure
        .use(auth_1.authMiddleware)
        .input(zod_1.z.object({ registrationNumber: zod_1.z.string(), issueId: zod_1.z.string(), status: zod_1.z.string() })) // Accept the new status as input
        .mutation((_a) => __awaiter(void 0, [_a], void 0, function* ({ input, ctx }) {
        var _b, _c;
        if (((_c = (_b = ctx.session) === null || _b === void 0 ? void 0 : _b.userDetails) === null || _c === void 0 ? void 0 : _c.role) !== 'admin') {
            throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'Admin access required' });
        }
        const user = yield usermodel_1.User.findOne({ registrationNumber: input.registrationNumber });
        if (!user) {
            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }
        const issue = user.placementIssues.id(input.issueId);
        if (!issue) {
            throw new server_1.TRPCError({ code: 'NOT_FOUND', message: 'Issue not found' });
        }
        // Update issue status to the provided value ('pending' or 'reviewed')
        issue.status = input.status;
        yield user.save();
        return { success: true, issue };
    })),
});
