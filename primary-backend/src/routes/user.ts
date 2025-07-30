import { Router } from "express";
import { middleware } from "../middleware";
import jwt from "jsonwebtoken"
import { client } from "../client/prismaClient";
import { ACCESS_KEY_ID, JWT_SECRET, SECRET_ACCESS_KEY } from "../config";

import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'

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

const s3Client = new S3Client({
  credentials : {
    accessKeyId : ACCESS_KEY_ID,
    secretAccessKey : SECRET_ACCESS_KEY
  },
   region : "ap-south-1"
})

router.get("/presignedurl", middleware, async (req, res)=>{
  //@ts-ignore
    const userId = req.userId

    const {url, fields} = await createPresignedPost(s3Client, {
      Bucket : `dhirendra-thumbnail-project-bucket`,
      Key :  `${userId}/${Math.random()}/image.jpg`,
       Conditions: [
        ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
        ],
        Fields: {
          'Content-Type': 'image/png'
        },
      Expires: 3600
    })
    // console.log({url, fields})
    res.json ({
      preSignedUrl : url ,
      fields
    })
})

export  const userRouter = router

