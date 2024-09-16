const dataErrorHandler = (error, req, res, next) => {
  console.log(error);
  if (error.code == "ENOTFOUND") {
    return res.status(502).send(error.message);
  }
  return res.status(400).send(error.message);
};

module.exports = dataErrorHandler;
