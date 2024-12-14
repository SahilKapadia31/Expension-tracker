// Import dependencies
const express = require("express");
const path = require("path");
const cors = require("cors");

const dbConnection = require("./config/db");
const Config = require("./config");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoute");

// Initialize Express app
const app = express();

// Set up configuration
const PORT = Config.PORT || 5000;

// Middleware setup
app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded data
app.use(cors()); // Enable CORS

// Serve static files from the uploads folder inside src
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

// Establish database connection
dbConnection();

// Define API routes
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);

// Start the server
app.listen(PORT, (err) => {
  if (err) {
    console.error("Error starting server:", err);
    process.exit(1); // Exit the process if the server fails to start
  }
  console.log(`Server is running at: http://localhost:${PORT}`);
});

// Export app for testing or further use
module.exports = app;
