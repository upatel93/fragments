/* global process */

// Import required modules and dependencies
const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const hashUser = require('../../hash');
const { validateContentType } = require('../../model/data/utils');

// Handler function for creating a new fragment
async function createFragment(req, res) {
  try {
    // Get the owner ID by hashing the user and Content Type
    const ownerId = hashUser(req.user);
    const contentType = req.headers['content-type'];

    // Create a new fragment object with owner ID and content type
    let data = new Fragment({ ownerId, type: contentType });

    // To check if the content type is valid
    await validateContentType(req.body, contentType);

    // Save the fragment object and set data
    await data.save();
    await data.setData(req.body);

    // Build the base URL using the request protocol and host
    const baseUrl = req.protocol + '://' + req.get('host');

    // Set the Location header with the URL of the newly created fragment
    res.set('Location', `${process.env.API_URL || baseUrl}/v1/fragment/${data.id}`);

    // Send the success response with the created fragment data
    res.status(201).json(
      createSuccessResponse({
        fragment: data,
      })
    );
  } catch (err) {
    // If an error occurs, send a 415 Unsupported Media Type response with the error message
    res.status(415).send(createErrorResponse(415, err.message));
  }
}

module.exports = {
  createFragment,
};
