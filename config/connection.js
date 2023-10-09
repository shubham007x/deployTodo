const mongoose = require("mongoose");
require("dotenv").config();
console.log(process.env.MONGODB);
const connection = mongoose.connect(`${process.env.MONGODB}Auth`);

module.exports = { connection };
