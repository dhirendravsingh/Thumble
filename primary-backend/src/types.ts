import z from "zod"

export const taskInput = z.object({
    title : z.string().optional(),
    options : z.array(z.object({
        image_url : z.string() 
    })),
    signature : z.string()
})