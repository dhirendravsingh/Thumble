import { Router } from "express";
import { middleware, workerMiddleware } from "../middleware";
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

router.get("/nextTask", workerMiddleware, async (req, res) => {
  try {
    //@ts-ignore
    const userId = req.userId;
    const task = await client.task.findFirst({
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
    }else {
      return res.status(200).json({
        task
       })
    }
  } catch (error) {
    console.error("Error fetching next task:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
});

export  const workerRouter = router

