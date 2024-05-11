import {Context as ContextTelegraf} from "telegraf";

export interface Context extends ContextTelegraf {
    session: {
        type?: 'done' | 'edit' | 'remove' | "write_request" | "send_request"
        role?: "user" | "admin"
        request?: string[]
    }
}