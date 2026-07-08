import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { authService } from "./auth.service";

const signupUser = async(req:Request ,res:Response) => {
    try{
        const result = await authService.signupUserIntoDB(req.body);
        sendResponse(res,{
            statusCode: 201,
            success: true,
            message: "User registered successfully",
            data: result.rows[0]
        })

    }catch(error:any){
        sendResponse(res,{
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        })
    }
}
const loginUser = async(req:Request ,res:Response) => {
    try{
        const result = await authService.loginUserIntoDB(req.body);
        console.log(result)
        // const  { refreshToken } = result;
        res.cookie("refreshToken",refreshToken,{
            secure: false,
            httpOnly: true,
            sameSite: "lax"
        })
        sendResponse(res,{
            statusCode: 200,
            success: true,
            message: "User login successfully",
            data: result
        })

    }catch(error:any){
        sendResponse(res,{
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        })
    }
}
const refreshToken = async(req:Request ,res:Response) => {
    try{

        const result = await authService.generateRefreshToken(req.cookies.refreshToken);
        sendResponse(res,{
            statusCode: 200,
            success: true,
            message: "Access token generate",
            data: result
        })

    }catch(error:any){
        sendResponse(res,{
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        })
    }
}

export const authController = {
    signupUser,
    loginUser,
    refreshToken
}