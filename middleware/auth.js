const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  if (typeof header !== 'undefined') {
    const bearer = header.split(' ');
    const token = bearer[1];
    const authData = await jwt.verify(token, process.env.SECRET_KEY);
    const id = authData._id;
    const user = await User.find({ _id: id });
    req.user = user;

    if (user[0].role !== 'Admin') {
      return res.json({ error: 'Sorry, You have no access for this Route!' });
    }
    next();
    return user;
  }
  return res.json({ error: 'Token is Invalid' });
};

const verifyTokenForUser = async (req, res, next) => {
  const header = req.headers.authorization;
  if (typeof header !== 'undefined') {
    const bearer = header.split(' ');
    const token = bearer[1];
    const authData = await jwt.verify(token, process.env.SECRET_KEY);
    const id = authData._id;
    const user = await User.find({ _id: id });
    req.user = user;

    next();
    return user;
  }
  return res.json({ error: 'Token is Invalid' });
};

module.exports = { verifyToken, verifyTokenForUser };
