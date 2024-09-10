"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.procedure = exports.router = exports.t = void 0;
// src/trpc.ts
const { initTRPC } = require('@trpc/server');
const { z } = require('zod');
exports.t = initTRPC.create();
exports.router = exports.t.router;
exports.procedure = exports.t.procedure;
