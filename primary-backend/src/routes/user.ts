import { Router } from "express";
import { middleware } from "../middleware";
import jwt from "jsonwebtoken"
import { client } from "../client/prismaClient";
import { ACCESS_KEY_ID, JWT_SECRET, SECRET_ACCESS_KEY } from "../config";

import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { taskInput } from "../types";

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

router.post("/task", middleware, async (req, res)=>{
  //@ts-ignore
    const user_id = req.userId

    const body = req.body
    const parsedInput = taskInput.safeParse(body)

    const DEFAULT_TITLE = "Please select the most clickable thumbnail"

    if(!parsedInput.success){
      return res.status(411).json({
        message : "Please enter correct inputs"
      })
    }

    let response = await client.$transaction(async tx =>{

      const response = await tx.task.create({
        data : {
          title : parsedInput.data?.title,
          amount : "1",
          signature : parsedInput.data?.signature,
          user_id : user_id
        }
      })

      await tx.option.createMany({
        data : parsedInput.data.options.map(x=>({
            image_url : x.image_url,
            task_id : response.id
        }))
      })
      return response
    })

    res.json({
      id : response.id
    })
})

export  const userRouter = router

