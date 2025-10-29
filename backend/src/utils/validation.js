/**
 * Create custom error
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} - Custom error object
 */
const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Async handler wrapper
 * @param {Function} fn - Async function
 * @returns {Function} - Wrapped function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Check if value is valid MongoDB ObjectId
 * @param {string} id - ID to check
 * @returns {boolean} - Whether ID is valid
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
  createError,
  asyncHandler,
  isValidObjectId
};
