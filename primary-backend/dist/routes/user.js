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
exports.userRouter = void 0;
const express_1 = require("express");
const middleware_1 = require("../middleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = require("../client/prismaClient");
const config_1 = require("../config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hardCodedAddress = "1234567890";
    const existingUser = yield prismaClient_1.client.user.findFirst({
        where: {
            address: hardCodedAddress
        }
    });
    if (existingUser) {
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser.id
        }, config_1.JWT_SECRET);
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
        }, config_1.JWT_SECRET);
        res.json({
            token
        });
    }
}));
const s3Client = new client_s3_1.S3Client({
    credentials: {
        accessKeyId: config_1.ACCESS_KEY_ID,
        secretAccessKey: config_1.SECRET_ACCESS_KEY
    },
    region: "ap-south-1"
});
router.get("/presignedurl", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const { url, fields } = yield (0, s3_presigned_post_1.createPresignedPost)(s3Client, {
        Bucket: `dhirendra-thumbnail-project-bucket`,
        Key: `${userId}/${Math.random()}/image.jpg`,
        Conditions: [
            ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
        ],
        Fields: {
            'Content-Type': 'image/png'
        },
        Expires: 3600
    });
    // console.log({url, fields})
    res.json({
        preSignedUrl: url,
        fields
    });
}));
router.post("/task", middleware_1.middleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const user_id = req.userId;
    const body = req.body;
    const parsedInput = types_1.taskInput.safeParse(body);
    const DEFAULT_TITLE = "Please select the most clickable thumbnail";
    if (!parsedInput.success) {
        return res.status(411).json({
            message: "Please enter correct inputs"
        });
    }
    let response = yield prismaClient_1.client.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const response = yield tx.task.create({
            data: {
                title: (_a = parsedInput.data) === null || _a === void 0 ? void 0 : _a.title,
                amount: "1",
                signature: (_b = parsedInput.data) === null || _b === void 0 ? void 0 : _b.signature,
                user_id: user_id
            }
        });
        yield tx.option.createMany({
            data: parsedInput.data.options.map(x => ({
                image_url: x.image_url,
                task_id: response.id
            }))
        });
        return response;
    }));
    res.json({
        id: response.id
    });
}));
exports.userRouter = router;
