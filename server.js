const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 8000;
const authRouter = require("./routers/authRouter.js");

app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(console.log("Database Connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", authRouter);

app.listen(PORT, () => console.log("Server running on port:", PORT));
