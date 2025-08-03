import { Router } from "express";
import { middleware } from "../middleware";
import jwt from "jsonwebtoken"
import { client } from "../client/prismaClient";

import { WORKER_JWT_SECRET } from "../config";
const router = Router()


router.post("/signin", async (req, res)=>{
    const hardCodedAddress = "123456735345"

    const existingUser = await client.user.findFirst({
        where : {
           address :  hardCodedAddress
        }
    })
    if(existingUser){
       const token = jwt.sign({
        userId : existingUser.id
       }, WORKER_JWT_SECRET)
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
       }, WORKER_JWT_SECRET)
        res.json({
        token
       })
    }
})



export  const workerRouter = router

