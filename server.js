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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const cors_1 = __importDefault(require("cors"));
const trpcExpress = __importStar(require("@trpc/server/adapters/express"));
const router_1 = require("./router");
const db_1 = __importDefault(require("./db")); // DB connection
const context_1 = require("./context"); // Import your createContext function
const app = (0, express_1.default)();
(0, db_1.default)();
app.use((0, cors_1.default)({
    origin: '*', // Replace with your frontend URL
    credentials: true,
}));
app.use((0, cookie_session_1.default)({
    name: 'session',
    secret: 'your-secret-key',
    maxAge: 24 * 60 * 60 * 1000,
    secure: false,
    httpOnly: true,
}));
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use('/trpc', trpcExpress.createExpressMiddleware({
    router: router_1.appRouter,
    createContext: context_1.createContext,
}));
app.listen(10000, () => {
    console.log('Server is running on http://localhost:4000');
});
