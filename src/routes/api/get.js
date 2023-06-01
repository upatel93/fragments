// src/routes/api/get.js

const { createSuccessResponse } = require('../../response');

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
    let fragmentdata = await Fragment.byId(plseaseHashIt(req.user), fragmentId);
    let data = await fragmentdata.getData();
    res.set('Content-Type', 'text/plain');
    res.status(200).send(data);
  } else {
    let resp = createSuccessResponse();
    let fragments = await Fragment.byUser(plseaseHashIt(req.user), expand);
    res.status(200).json({
      status: resp.status,
      fragments: fragments,
    });
  }
};
