import { app } from "./app.js";
import connect from "./db/index.js"
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
})

connect()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
    app.on("error", () => {
      console.log(`Server failed: ${error}`);
    });
  })
  .catch((err) => console.log(`MongoDB connection failer ${err}`));