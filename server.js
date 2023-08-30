const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
//convert everything to object so backend can read
const bodyParser = require("body-parser");
const cors = require("cors");
const errorHandler = require("./middleWare/errorMiddleware");
const cookieParser = require("cookie-parser");
// const path = require("path");

//IMPORT ROUTES
const userRoute = require("./routes/userRoute");

//INITIALIZE SERVER
const app = express();

//MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    // origin: ["http://localhost:4000", "https://pinvent-app.vercel.app"],
    // origin: ["http://192.168.0.14:4000", "https://pinvent-app.vercel.app"],
    origin: ["http://192.168.0.13:4000", "https://pinvent-app.vercel.app"],
      //  POVEZI TELEFON NA WIFI ISTI KAO I KOMP !!!!!!!
    credentials: true, // enable sending credentials from backend to frontend
  })
);

// Routes Middlewares
app.use("/api/users", userRoute);

//ROUTES
app.get("/", (req, res) => {
  res.send("HOMEEE PAGEEEE");
});

// ERROR MIDDLEWARE
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
