// src/routes/api/get.js

const { createSuccessResponse, createErrorResponse } = require('../../response');

//importing Fragment class..
const { Fragment } = require('../../model/fragment');

// Hashing MOdule import
const hashUser = require('../../hash');


async function getFragmentById(req, res) {
  const fragmentId = req.params.id;

  try {
    let fragmentData = await Fragment.byId(hashUser(req.user), fragmentId);
    let data = await fragmentData.getData();
    res.set('Content-Type', fragmentData.type);
    res.status(200).send(data);
  } catch (error) {
    res
      .status(404)
      .json(
        createErrorResponse(
          404,
          `Got an ${error}, while requesting fragment with id: ${fragmentId}`
        )
      );
  }
}

async function getFragmentsByUser(req, res) {
  const expand = req.query.expand;

  try {
    let fragments = await Fragment.byUser(hashUser(req.user), expand);
    res.status(200).json(createSuccessResponse({ fragments: fragments }));
  } catch (error) {
    res
      .status(500)
      .json(createErrorResponse(500, `An error occurred: ${error}`));
  }
}


module.exports = {
  getFragmentById,
  getFragmentsByUser,
};