import EventEmitter from "events";
import { FuncType } from "../../@types";
import { BaseError } from "../../Errors";

class JobToTrack<T extends () => Promise<any>> extends EventEmitter {
    // type of request (db, http request, ...)
    type: FuncType;
    private func: T;
    private output: Awaited<ReturnType<T>> | Error | undefined;
    constructor(func: T, type: FuncType) {
        super();
        this.type = type;
        this.func = func;
        this.output = undefined;
        return new Proxy(this, {
            set(target, property, newValue: Awaited<ReturnType<T>> | Error) {
                if (property == "output" && !target.output) {
                    target[property] = newValue;
                    if (newValue instanceof Error) target.emit("error", newValue);
                    else target.emit("result", newValue);
                }
                return true;
            },
        });
    }

    async process(): Promise<void> {
        try {
            this.output = await this.func();
        } catch (err) {
            if (err instanceof Error) this.output = err;
            else this.output = new BaseError("", "Unknown error occured", 404);
        }
    }
}

export default JobToTrack;
