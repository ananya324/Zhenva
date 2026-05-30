const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { config } = require("./config");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use("/audio", express.static("audio"));
app.use("/uploads", express.static("uploads"));

const textRoutes = require("./routes/text.routes");
const imageRoutes = require("./routes/image.routes");
const videoRoutes = require("./routes/video.routes");

app.use("/api/check/text", textRoutes);
app.use("/api/check/image", imageRoutes);
app.use("/api/check/video", videoRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Something went wrong",
  });
});

mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });