"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskInput = void 0;
const zod_1 = __importDefault(require("zod"));
exports.taskInput = zod_1.default.object({
    title: zod_1.default.string().optional(),
    options: zod_1.default.array(zod_1.default.object({
        image_url: zod_1.default.string()
    })),
    signature: zod_1.default.string()
});
