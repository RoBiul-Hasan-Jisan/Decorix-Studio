require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();   

// ----------------------
// CORS Configuration
// ----------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://decorix-studio-8ukl.vercel.app/",
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.trim());
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (/^https:\/\/decorix-studio.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked CORS Origin:", origin);

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

app.options("*", cors());

app.use(express.json());