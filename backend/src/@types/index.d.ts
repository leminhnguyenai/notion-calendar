import { Request } from "express";
import { IncomingHttpHeaders } from "http";
import { RowDataPacket } from "mysql2/promise";

type Option = {
  name: string;
  id: string;
};

export interface NotionConnection extends RowDataPacket {
  connection_id: string;
  calendar_id: string;
  user_id: string;
  calendar_name: string;
  next_execution_time: string;
  sync_rate: number;
  statistic: "system" | "dark" | "light";
  name: Option;
  date: Option;
  description?: Option;
  done_method?: Option;
  done_method_option?: Option;
}

export interface NewNotionConnection extends RowDataPacket {
  calendar_name: string;
  sync_rate?: number;
  statistic?: "system" | "dark" | "light";
  name: Option;
  date: Option;
  description?: Option;
  done_method?: Option;
  done_method_option?: Option;
}

export interface User extends RowDataPacket {
  user_id: string;
  email: string;
  refresh_token: string;
  role: "user" | "admin";
}

export interface CustomRequest extends Request {
  refresh_token?: string;
  //* Have a property for auth client (maybe)
  headers: IncomingHttpHeaders & {
    authorization?: string;
  };
}

export type FuncType = "db" | "fetch_notion" | "fetch_google";

export type WorkerRequest = {
  level: "non-blocking" | "warning" | "stop_immedately";
  request: "update" | "delete";
};
