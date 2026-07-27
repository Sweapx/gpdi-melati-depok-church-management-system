import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jwt-simple";
import { inMemoryDB, usePostgres, pool } from "../db/index.ts";

const router = Router();
const SECRET = process.env.JWT_SECRET || "default_super_secret";

// Seed default admin if in-memory
const seedAdmin = async () => {
  const hash = await bcrypt.hash("admin123", 10);
  if (!usePostgres && inMemoryDB.adminUsers.length === 0) {
    inMemoryDB.adminUsers.push({
      id: "admin-1",
      username: "admin",
      passwordHash: hash,
      name: "Super Admin",
      role: "super_admin",
      mustChangePassword: true,
    });
  }
};
seedAdmin();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    let user;

    if (usePostgres && pool) {
      // Query with direct column names (no alias)
      const { rows } = await pool.query(
        "SELECT id, username, password_hash, name, role, must_change_password FROM admin_users WHERE username = $1",
        [username]
      );
      if (rows.length > 0) {
        user = {
          ...rows[0],
          passwordHash: rows[0].password_hash,
          mustChangePassword: rows[0].must_change_password
        };
      }
    } else {
      user = inMemoryDB.adminUsers.find(u => u.username === username);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash || user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.encode(payload, SECRET);

    res.json({ 
      success: true, 
      data: { token, mustChangePassword: user.mustChangePassword, name: user.name } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login error", error: error.message });
  }
});

router.get("/verify", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "No token" });
  
  try {
    const decoded = jwt.decode(token, SECRET);
    res.json({ success: true, data: decoded });
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

export default router;
