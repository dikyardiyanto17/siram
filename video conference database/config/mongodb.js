const mongoose = require('mongoose');

const uri = process.env.MONGODB_MY_DATABASE;

async function connect() {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error', error);
  }
}


module.exports = connect