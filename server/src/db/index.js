import mongoose from "mongoose";

const connect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${process.env.DB_NAME}`
    );
    console.log(
      `MongoDB connected !! Database Host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`MONGODB connection error: ${error}`);
    process.exit(1);
  }
};

export default connect;