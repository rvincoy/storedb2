const mongodb = require("../db/connect");
const ObjectId = require("mongodb").ObjectId;

const deleteUserHandler = async (req, res) => {
    // your delete logic here, e.g. using a User model
    res.json({ message: `User ${req.params.id} deleted` });
  };

  module.exports = { deleteUserHandler };
