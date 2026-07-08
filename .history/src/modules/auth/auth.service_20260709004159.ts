import bcrypt from "bcryptjs";
import { pool } from "../../db";
import sendResponse from "../../utility/sendResponse";
import { jwtHelper } from "../../utility/jwt";
import config from "../../config";
import type { JwtPayload } from "jsonwebtoken";

const signupUserIntoDB = async(payload:{
    name: string,
    email: string,
    password: string,
    role: string
}) => {

        const {name,email,password,role}= payload;

        const hashedPassword = await bcrypt.hash(password,12);

        const result = await pool.query(`
            INSERT INTO users (name,email,password,role) VALUES($1,$2,$3,$4)
            RETURNING *
            `,
        [name,email,hashedPassword,role])

       const user = result.rows[0];
        delete user.password;

        return user
}

const loginUserIntoDB = async(payload:{
    email: string,
    password: string,
}) => {

        const {email,password}= payload;

        const userData = await pool.query(`
            SELECT * FROM users WHERE email=$1
            `,
        [email]);
        if(userData.rows.length === 0){
            throw new Error("User not found!")
        }

        const user = userData.rows[0];
        const matchPassword = await bcrypt.compare(password,user.password)

        if(!matchPassword){
            throw new Error("Invalid Credentials!")
        }

        const jwtPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }

        const accessToken = jwtHelper.generateToken(
            jwtPayload,
            config.secret as string,
            {
                expiresIn: "1d",
            }
            );

        // const refreshToken = jwtHelper.generateToken(
        //     jwtPayload,
        //     config.refresh_secret as string,
        //     {
        //         expiresIn: "7d",
        //     }
        //     );
        delete user.password;
        
        return { token:accessToken, user }
}

// const generateRefreshToken = async(token: string)=> {
//     if(!token){
//         throw new Error("Unauthorized access")
//     }

//     const decoded = jwtHelper.verifyToken(
//         token,
//         config.refresh_secret as string
//     ) as JwtPayload;

//     const userData = await pool.query(
//         `
//         SELECT * FROM users WHERE email = $1
//         `,
//         [decoded.email],
//       );
//     const user = userData.rows[0];

//       if (userData.rows.length === 0) {
//         throw new Error("User not found!");
//       }

//       const jwtPayload = {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             role: user.role
//         }

//         const accessToken = jwtHelper.generateToken(
//             jwtPayload,
//             config.secret as string,
//             {
//                 expiresIn: "1d",
//             }
//             );
//         return { accessToken }
// }

export const authService ={
    signupUserIntoDB,
    loginUserIntoDB,
    // generateRefreshToken
}