/**
 * Paginate results
 * @param {Object} model - Mongoose model
 * @param {Object} query - Query filter
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} - Paginated results
 */
const paginate = async (model, query = {}, options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;
  
  const sort = options.sort || { createdAt: -1 };
  const select = options.select || '';
  const populate = options.populate || '';

  try {
    const [data, total] = await Promise.all([
      model
        .find(query)
        .select(select)
        .populate(populate)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      model.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    throw error;
  }
};

module.exports = { paginate };
