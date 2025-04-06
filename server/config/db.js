const mongoose = require('mongoose');

const connectToDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error("MONGO_URI is not defined in the environment variables");
    }
    await mongoose.connect(uri);
    console.log("Database connection successful");
}

module.exports = connectToDB;