// Express 4 doesn't automatically catch errors thrown inside an async
// route handler — without this, a failed `await` (e.g. a database call
// that errors) hangs the request forever instead of responding, which
// looks like "Failed to fetch" in the browser. Wrapping every async
// handler with this sends the error to Express's error-handling
// middleware instead, so the client gets a real JSON error back.
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
