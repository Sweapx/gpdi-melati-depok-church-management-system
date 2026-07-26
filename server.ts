import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import apiRouter from "./src/server/routes/index.ts";

// Initialize environment variables
dotenv.config();

// Ensure upload directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  
  // Static uploads directory
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // API Routes Placeholder
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is healthy" });
  });

  // Import router
  app.use("/api", apiRouter);

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Error Handler:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
