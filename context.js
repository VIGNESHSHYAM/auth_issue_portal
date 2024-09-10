"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
// This is how you'll create your context
const createContext = ({ req, res }) => {
    return {
        req,
        res,
        session: {} // Initialize an empty session object
    };
};
exports.createContext = createContext;
