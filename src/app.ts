import express, {Application} from 'express'
import cookieParser from 'cookie-parser'
import {postRouter} from './routes/posts'
import dotenv from 'dotenv'
import cors from 'cors';

if(process.env.NODE_ENV === 'development'){
    //开发环境, 为了部署在 vercel 方便, 所以生产环境的配置不在文件里做
    dotenv.config()
}


const app: Application = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())
app.use("/api/posts", postRouter);

const {PORT = 5000} = process.env
app.listen(PORT, () => {
    process.stdout.write(`Server started at http://localhost:${PORT}`);
});



export default app
