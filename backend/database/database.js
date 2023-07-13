const mongoose = require("mongoose");
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
const connecttoDB = async () => {
  await mongoose.connect(process.env.DB_URI, options).then((data) => {
    console.log(`Database connected with server ${data.connection.host}`);
  });
};

module.exports = connecttoDB;
