import  express, { json }  from "express";
import cors from "cors"
import{ userRouter} from "./routes/user"
import { workerRouter } from "./routes/worker";

const app = express()

app.use(cors({
    origin : "*"
}))
app.use(express.json())

app.use("/v1/user", userRouter)
app.use("/v1/worker", workerRouter)


app.listen(3000)