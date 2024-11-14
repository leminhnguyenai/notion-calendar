import EventEmitter from 'events';
import { FuncType } from '../../@types';
import { BaseError } from '../../Errors';

class JobToTrack<T extends Promise<any>> extends EventEmitter {
    // type of request (db, http request, ...)
    type: FuncType;
    private promise: T;
    private output: Awaited<T> | Error | undefined;
    constructor(promise: T, type: FuncType) {
        super();
        this.type = type;
        this.promise = promise;
        this.output = undefined;
        return new Proxy(this, {
            set(target, property, newValue: Awaited<T> | Error) {
                if (property == 'output' && !target.output) {
                    target[property] = newValue;
                    if (newValue instanceof Error)
                        target.emit('error', newValue);
                    else target.emit('result', newValue);
                }
                return true;
            },
        });
    }

    async process(): Promise<void> {
        try {
            this.output = await this.promise;
        } catch (err) {
            if (err instanceof Error) this.output = err;
            else this.output = new BaseError('', 'Unknown error occured', 404);
        }
    }
}

export default JobToTrack;
