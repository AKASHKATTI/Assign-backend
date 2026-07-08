require("dotenv").config({ path: "./config/.env" });

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const importRoutes = require("./routes/import.routes");


const app = express();

const allowedOrigins = [
  process.env.CLIENT_CONNECTION,
  // "http://localhost:3000",
  // "http://localhost:3001",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error(`CORS blocked for origin: ${origin}`), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);



console.log("Allowed CORS Origins =", allowedOrigins);
console.log("PORT =", process.env.PORT);

app.use(express.json());

app.use("/api/import", importRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (error) {
    console.error("Failed to start server due to DB connection error:", error);
    process.exit(1);
  }
};

startServer();