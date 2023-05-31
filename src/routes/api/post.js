/* global process */

// Fragment Class
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  let data = new Fragment({ ownerId: 'TestOwner', type: 'text/plain' });
  await data.save();
  await data.setData(req.body);
  let sendData = {
    status: 'ok',
    fragment: data,
  };
  res.set('Location',`${process.env.API_URL}/v1/fragment/${data.id}`)
  res.status(201).json(sendData);
};