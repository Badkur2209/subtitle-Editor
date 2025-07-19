const express = require("express");
const cors = require("cors");
require("dotenv").config();

const textBasedRoutes = require("./routes/textBased");
const { testDbConnection } = require("./db"); // Import the function

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/textbased", textBasedRoutes); // use routes before listen

const PORT = process.env.PORT || 5000;

// Test DB connection before starting the server
testDbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});