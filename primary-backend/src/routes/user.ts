import { Router } from "express";
import { middleware } from "../middleware";
import jwt from "jsonwebtoken"
import { client } from "../client/prismaClient";
import { JWT_SECRET } from "../config";

const router = Router()

router.post("/signin", async (req, res)=>{
    const hardCodedAddress = "1234567890"

    const existingUser = await client.user.findFirst({
        where : {
           address :  hardCodedAddress
        }
    })
    if(existingUser){
       const token = jwt.sign({
        userId : existingUser.id
       }, JWT_SECRET)
       res.json({
        token
       })
    } else {
      const newUser = await client.user.create({
        //@ts-ignore
        data : {
          address  : hardCodedAddress 
          
        }
      })
      const token = jwt.sign({
        userId : newUser.id
       }, JWT_SECRET)
        res.json({
        token
       })
    }
})



export  const userRouter = router

