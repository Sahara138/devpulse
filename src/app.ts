import express from 'express'
import type { Application, Request, Response } from "express";
import cors from 'cors'
import sendResponse from './utility/sendResponse';
import { authRoute } from './modules/auth/auth.route';

const app : Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({extended:true}))

const corsOptions = {
    origin: 'http://localhost:3000',
}
app.use(cors(corsOptions))

app.get('/', (req:Request ,res:Response) => {
    sendResponse(res,{
            statusCode: 200,
            success : true,
            message : "Devpulse Server",
        })
})

app.use('/api/auth',authRoute)


export default app;