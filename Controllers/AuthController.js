import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  findByEmail,
  checkIfEmailExists,
  createUser,
  findById,
  updateUser,
  deleteUser,
  listUsers,
  toggleUserActive,
} from "../Models/UserModel.js";
import { registerSchema, loginSchema } from "../Validator/validation.js";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export async function register(req, res) {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ status: "validation_error", errors: error.details.map(e => e.message) });

    const { name, email, password, role } = value;

    const exists = await checkIfEmailExists(email);
    if (exists.length > 0)
      return res.status(400).json({ error: "Email already registered" });

    const creatorRole = req.user?.role || "public";
    const restrictedRoles = ["doctor", "ngo", `admin`];
    if (restrictedRoles.includes(role) && creatorRole !== "admin") {
      return res.status(403).json({
        error: `Only admin can create users with role: ${role}`,
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await createUser(name, email, hashed, role);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { id: result.insertId, email, role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ status: "validation_error", errors: error.details.map(e => e.message) });

    const { email, password } = value;

    const rows = await findByEmail(email);
    if (rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const user = rows[0];
     //console.log('login attempt user row:', user);//check user 

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}


export async function getAllUsers(req, res) {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    const users = await listUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUser(req, res) {
  try {
    const user = await findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function editUser(req, res) {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    const { name, email, password, role, is_active } = req.body;
    const data = { name, email, role, is_active };

    if (password) {
      data.password_hash = await bcrypt.hash(password, 10);
    }

    const result = await updateUser(req.params.id, data);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ success: true, message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function removeUser(req, res) {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    const result = await deleteUser(req.params.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}


export async function setUserActiveStatus(req, res) {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    const { active } = req.body;
    await toggleUserActive(req.params.id, active);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
