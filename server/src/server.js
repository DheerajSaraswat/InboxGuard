import { app } from "./app.js";
import connect from "./db/index.js"
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({
    path: "./.env"
})

const tempDir = "public/temp";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log(`Created missing directory: ${tempDir}`);
}

connect()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
    app.on("error", (error) => {
      console.log(`Server failed: ${error}`);
    });
  })
  .catch((err) => console.log(`MongoDB connection failer ${err}`));


  import "./jobs/cleanupAccount.js";