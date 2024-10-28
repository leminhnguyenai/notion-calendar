import { BaseError, SqlError } from "../../Errors";
const updateErrorHandler = (err, req, res, next) => {
    console.log(err);
    if (err instanceof BaseError) {
        res.status(err.statusCode).send(err.message);
    }
    else if (err instanceof SqlError) {
        res.status(err.statusCode).send(err.message);
    }
    else
        res.status(400).send(err.message);
    next();
};
export default updateErrorHandler;
