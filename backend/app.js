import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/user.js";
import { db } from "./utils/db.js";
// import path from "path"
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
import route from "./routes/payment.js";
import helmet from "helmet";
import compression from "compression";
import './models/index.js'
dotenv.config({quiet:true});
const app =express();
app.use(cors());
// app.use(express.static(path.join(__dirname, "../frontend")));

// app.use(helmet())  //set special headers
app.use(compression())  // reduce the asset size
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(router);
app.use(route);
const port=3000;

db.sync().then(() => {
  try {
    app.listen(port, () => {
      console.log(`✅ Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(`❌ Server error: ${error.message}`);
  }
}).catch(err => {
  console.log(`❌ DB Sync error: ${err.message}`);
});