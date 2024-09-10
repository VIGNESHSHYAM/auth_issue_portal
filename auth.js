"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.authMiddleware = exports.verifyPassword = exports.hashPassword = void 0;
exports.createJWT = createJWT;
exports.verifyJWT = verifyJWT;
const server_1 = require("@trpc/server");
const jwt = __importStar(require("jsonwebtoken"));
const bcrypt = __importStar(require("bcryptjs"));
// Constants
const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your_secret_key';
// Authentication Utility Functions
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    return bcrypt.hash(password, 10);
});
exports.hashPassword = hashPassword;
const verifyPassword = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return bcrypt.compare(password, hashedPassword);
});
exports.verifyPassword = verifyPassword;
function createJWT(registrationNumber, role) {
    const payload = { registrationNumber, role };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}
function verifyJWT(token) {
    try {
        // Use the same secret as in `createJWT`
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (err) {
        console.error('JWT verification error:', err); // Additional logging
        throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token' });
    }
}
// Middleware for JWT Verification
const authMiddleware = (_a) => __awaiter(void 0, [_a], void 0, function* ({ ctx, next }) {
    const { req } = ctx;
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyJWT(token);
        if (!decoded || typeof decoded !== 'object') {
            throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token' });
        }
        ctx.session = { userDetails: { registrationNumber: decoded.registrationNumber, role: decoded.role } };
    }
    catch (err) {
        console.error('Token verification error:', err); // Additional logging
        throw new server_1.TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid token' });
    }
    return next();
});
exports.authMiddleware = authMiddleware;
