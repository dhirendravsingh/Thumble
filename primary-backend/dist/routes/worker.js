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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = require("../client/prismaClient");
const config_1 = require("../config");
const router = (0, express_1.Router)();
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hardCodedAddress = "123456735345";
    const existingUser = yield prismaClient_1.client.user.findFirst({
        where: {
            address: hardCodedAddress
        }
    });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser.id
        }, config_1.WORKER_JWT_SECRET);
        res.json({
            token
        });
    }
    else {
        const newUser = yield prismaClient_1.client.user.create({
            //@ts-ignore
            data: {
                address: hardCodedAddress
            }
        });
        const token = jsonwebtoken_1.default.sign({
            userId: newUser.id
        }, config_1.WORKER_JWT_SECRET);
        res.json({
            token
        });
    }
}));
router.get("/nextTask", middleware_1.workerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //@ts-ignore
        const userId = req.userId;
        const task = yield prismaClient_1.client.task.findFirst({
            where: {
                //@ts-ignore
                done: false,
                submission: {
                    none: {
                        woker_id: userId
                    }
                }
            },
            select: {
                title: true,
                options: true,
            }
        });
        if (!task) {
            return res.status(404).json({
                message: "No tasks available for you to review."
            });
        }
        else {
            return res.status(200).json({
                task
            });
        }
    }
    catch (error) {
        console.error("Error fetching next task:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}));
exports.workerRouter = router;
