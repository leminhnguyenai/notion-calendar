import { FormattedConnType } from "./connections";

export type CalIdObj = {
    calendarId: string;
};

export type Job = {
    type: string;
    method: string;
    data: FormattedConnType | CalIdObj;
};

export type SendingRequest = {
    status: 0;
};

export type SuccessJobRequest = {
    status: 200;
    respondData: object;
};
export type FailedJobRequest = {
    status: 400 | 403 | 404 | 502;
    error: string;
};

export type JobRequest = {
    id: string;
    job: Job;
} & (SuccessJobRequest | FailedJobRequest | SendingRequest);
