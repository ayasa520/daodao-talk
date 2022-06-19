import express, {Application, Request, Response, NextFunction, Router} from 'express'
import path from 'path';
import sqlite3, {Database} from 'sqlite3'
import cookieParser from 'cookie-parser'
import indexRouter from './routes/index'
import apiRouter from './routes/api'

const db: Database = new sqlite3.Database('/home/rikka/project/lingmeng/src/money.db', () => {});
const app: Application = express();
const sql1 = db.prepare("update reimu set money = money + 1000");

var logger = require('morgan');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);


const {PORT = 3000} = process.env
app.listen(PORT,()=>console.log('Server running'));
export default app
