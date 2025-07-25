import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "./config"
export const middleware= async (req : Request, res : Response, next : NextFunction ) => {
    const token = req.headers.authorization as unknown as string
    
    try {
        const response = jwt.verify(token, JWT_SECRET)
            //@ts-ignore
            req.userId = response.userId
            next()
        
    } catch (error) {
        return res.status(401).json({
            message : "You are not logged in"
        })
    }
}