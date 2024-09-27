const AppError = require("../AppError");

const backgroundErrorHandler = (error, req, res, next) => {
  if (error instanceof AppError) {
    console.log(error);
    return res.status(error.statusCode).send(error.message);
  }
  return res.status(400).send(error.message);
};

module.exports = backgroundErrorHandler;
