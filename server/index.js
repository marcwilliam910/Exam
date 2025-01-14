import express from "express";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import cors from "cors";

import {validateStudentInput} from "./utils/validateInput.js";

dotenv.config();

const app = express();
const port = process.env.DB_PORT || 3000;
app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/students", async (_, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM students");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Error fetching students"});
  }
});

app.get("/students/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const [rows] = await pool.query("SELECT * FROM students WHERE id =?", [id]);

    if (rows.length === 0)
      return res.status(404).json({message: "Student not found"});

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Error fetching student"});
  }
});

app.post("/students", async (req, res) => {
  try {
    const {name, age, email} = req.body;

    const validationErrors = validateStudentInput(name, email, age);
    if (validationErrors.length > 0) {
      return res.status(400).json({errors: validationErrors});
    }

    const [result] = await pool.query(
      "INSERT INTO students (name, age, email) VALUES (?,?,?)",
      [name, Number(age), email]
    );

    res.status(201).json({
      message: "Student created successfully",
      student: {id: result.insertId, name, age, email},
    });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      res.status(404).json({message: "Email already exists"});
    } else {
      res.status(500).json({error: "Error creating student"});
    }
  }
});

app.put("/students/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const {name, age, email} = req.body;

    const validationErrors = validateStudentInput(name, email, age);
    if (validationErrors.length > 0) {
      return res.status(400).json({errors: validationErrors});
    }

    const [result] = await pool.query(
      "UPDATE students SET name =?, age =?, email =? WHERE id =?",
      [name, Number(age), email, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({message: "Student not found"});
    }

    res.json({
      message: "Student updated successfully",
      student: {id, name, age, email},
    });
  } catch (error) {
    console.error("Error updating student:", error);
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({error: "Email already exists"});
    } else {
      res.status(500).json({error: "Error updating student"});
    }
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const [result] = await pool.query("DELETE FROM students WHERE id =?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({message: "Student not found"});
    }

    res.json({message: "Student deleted successfully"});
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({error: "Error deleting student"});
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Successfully connected to the database");
    connection.release();
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

testDatabaseConnection();
