const AppError = require("../AppError");

const connectionsErrorHandler = (error, req, res) => {
  if (error instanceof AppError) {
    console.log(error);
    return res.status(error.statusCode).send(error.message);
  }
  return res.status(400).send(error.message);
};

module.exports = connectionsErrorHandler;
