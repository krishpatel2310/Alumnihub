import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST
dotenv.config({
  path: path.join(__dirname, "../.env"),
  debug: false
});

const PORT = process.env.PORT || 5000;

// Use dynamic imports to ensure env vars are loaded first
const startServer = async () => {
  const { default: connectDB } = await import("./db/server.js");
  const { default: app } = await import("./app.js");

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to connect to the database:", error);
      process.exit(1);
    });
};

startServer();


  