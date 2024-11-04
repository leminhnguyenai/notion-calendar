import { Request } from "express";
import { IncomingHttpHeaders } from "http";
import { RowDataPacket } from "mysql2/promise";

type Option = {
    name: string;
    id: string;
};

export interface NotionConnection extends RowDataPacket {
    calendar_id: string;
    calendar_name: string;
    name: Option;
    date: Option;
    description?: Option;
    done_method?: Option;
    done_method_option?: Option;
}

export interface NewNotionConnection extends RowDataPacket {
    calendar_name: string;
    name: Option;
    date: Option;
    description?: Option;
    done_method?: Option;
    done_method_option?: Option;
}

export interface NotionConnectionSetting extends RowDataPacket {
    calendar_id: string;
    sync_rate: number;
    statistic: boolean;
}

export interface User extends RowDataPacket {
    user_id: number;
    email: string;
    refresh_token: string;
}

export interface CustomRequest extends Request {
    refresh_token?: string;
    //* Have a property for auth client (maybe)
    headers: IncomingHttpHeaders & {
        authorization?: string;
    };
}

export type FuncType = "db" | "fetch_notion" | "fetch_google";
