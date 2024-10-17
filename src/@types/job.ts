import { FormattedConnType } from "./sql";

export type Job = {
    type: string;
    method: string;
    data: object | FormattedConnType;
};

type SendingRequest = {
    status: 0;
};

type SuccessJobRequest = {
    status: 200;
    respondData: string | object;
};
type FailedJobRequest = {
    status: 400 | 404 | 502;
    error: string;
};

//* Make a discriminiated union type for JobRequest && adjust the type & typeguard accordlingly
export type JobRequest = {
    id: string;
    job: Job;
} & (SuccessJobRequest | FailedJobRequest | SendingRequest);
