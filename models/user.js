const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    refreshToken: String,
    resetCode: String,
    resetTokenExpiration: Date
  });
  
  const UserModel = mongoose.model("Users", UserSchema);

  module.exports = UserModel;