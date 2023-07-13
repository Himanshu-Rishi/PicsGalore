// error handler for async error

module.exports = (async_error) => (req, res, next) => {
  Promise.resolve(async_error(req, res, next)).catch(next);
};
