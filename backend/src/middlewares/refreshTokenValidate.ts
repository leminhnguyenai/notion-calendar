import { NextFunction, Response } from "express";
import mysql, { Connection } from "mysql2/promise";
import { CustomRequest, User } from "../@types";
import { BaseError } from "../Errors";
import { connectionOption } from "../config/db";

const refreshTokenValidate = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.headers.authorization) throw new BaseError("", "No refresh token provided", 400);
        const refresh_token: string = req.headers.authorization.split(" ")[1];
        const conn: Connection = await mysql.createConnection(connectionOption);
        const [users] = await conn.query<User[]>(
            `SELECT * FROM users WHERE refresh_token = '${refresh_token}'`
        );
        if (users.length !== 1) throw new BaseError("", "Error finding user", 400);
        req.refresh_token = refresh_token;
        next();
    } catch (err) {
        next(err);
    }
};

export default refreshTokenValidate;
