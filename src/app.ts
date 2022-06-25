import express, {Application} from 'express'
import cookieParser from 'cookie-parser'
import {postRouter} from './routes/posts'
import { connectToDatabase } from "./service/database"
import dotenv from 'dotenv'


if(process.env.NODE_ENV === 'development'){
    //开发环境, 为了部署在 vercel 方便, 所以生产环境的配置不在文件里做
    dotenv.config()
}

const app: Application = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const {PORT = 5000} = process.env


connectToDatabase()
    .then(() => {

        app.use("/api/posts", postRouter);

        app.listen(PORT, () => {
            console.log(`Server started at http://localhost:${PORT}`);
        });
    })
    .catch((error: Error) => {
        console.error("Database connection failed", error);
        process.exit();
    });

export default app
