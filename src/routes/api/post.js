/* global process */

//response 
const {createErrorResponse} = require('../../response')

// Fragment Class
const { Fragment } = require('../../model/fragment');

// Hashing MOdule import
const plseaseHashIt = require('../../hash');

module.exports = async (req, res) => {
  try {
  let data = new Fragment({ ownerId: `${plseaseHashIt(req.user)}`, type: req.headers["content-type"] });
  await data.save();
  await data.setData(req.body);
  let sendData = {
    status: 'ok',
    fragment: data,
  };
  const baseUrl = req.protocol + '://' + req.get('host');
  res.set('Location',`${process.env.API_URL || baseUrl}/v1/fragment/${data.id}`)
  res.status(201).json(sendData);
}
catch (err){
  res.status(415).send(createErrorResponse(415,err.message));
}
};