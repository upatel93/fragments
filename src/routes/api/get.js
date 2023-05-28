// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  // TODO: this is just a placeholder to get something working...
  let resp = createSuccessResponse();
  res.status(200).json({
    status: resp.status,
    fragments: [],
  });
};
