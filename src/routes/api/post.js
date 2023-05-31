/* global process */

// Fragment Class
const { Fragment } = require('../../model/fragment');

// Hashing MOdule import
const plseaseHashIt = require('../../hash');

module.exports = async (req, res) => {
  let data = new Fragment({ ownerId: `${plseaseHashIt(req.user)}`, type: req.headers["content-type"] });
  await data.save();
  await data.setData(req.body);
  let sendData = {
    status: 'ok',
    fragment: data,
  };
  res.set('Location',`${process.env.API_URL || req.headers.host}/v1/fragment/${data.id}`)
  res.status(201).json(sendData);
};