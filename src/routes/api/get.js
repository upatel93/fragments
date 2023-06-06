// src/routes/api/get.js

const { createSuccessResponse, createErrorResponse } = require('../../response');

//importing Fragment class..
const { Fragment } = require('../../model/fragment');

// Hashing MOdule import
const plseaseHashIt = require('../../hash');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  const fragmentId = req.params.id;
  const expand = req.query.expand;

  if (fragmentId) {
    try {
      let fragmentdata = await Fragment.byId(plseaseHashIt(req.user), fragmentId);
      let data = await fragmentdata.getData();
      res.set('Content-Type', data.type);
      res.status(200).send(data);
    } catch (error) {
      res.status(404).json(createErrorResponse(404,`Got an ${error}, while requesting fragment with id: ${fragmentId}`));
    }
  } else {
    let resp = createSuccessResponse();
    let fragments = await Fragment.byUser(plseaseHashIt(req.user), expand);
    res.status(200).json({
      status: resp.status,
      fragments: fragments,
    });
  }
};
