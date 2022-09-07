import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(express.json());
app.use(cors());

const port = 4000;
const pool = mysql.createPool({
  host: "localhost",
  user: "sbsst",
  password: "sbs123414",
  database: "diaryproject",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const getData = async () => {
  const data = await axios.get("http://localhost:3000");
};

app.post("/diary/create", async (req, res) => {
  const {
    body: { title, text },
  } = req;
  await pool.query(
    `
    INSERT INTO diarytable
    (title, text) VALUES
    (?,?)
    `,
    [title, text]
  );
  const [diaryinsert] = await pool.query(
    `SELECT id, title, text,
    DATE_FORMAT(reg_date,'%Y-%m-%d') reg_date
    FROM diarytable 
    ORDER BY id DESC`
  );
  res.json(diaryinsert);
});

app.get("", async (req, res) => {
  const [rows] = await pool.query(`SELECT id, title, text, 
  DATE_FORMAT(reg_date,'%Y-%m-%d') reg_date
  FROM diarytable 
  ORDER BY id DESC`);
  res.json(rows);
});

app.get("/diary/:id", async (req, res) => {
  //const id = req.params.id;
  const { id } = req.params; //axios 날릴 때 url에 id 같이보내줘야함
  const [rows] = await pool.query(
    `
  SELECT *
  FROM diarytable
  WHERE id = ?;
  `,
    [id]
  );
  if (rows.length === 0) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }
  res.json(rows[0]);
});

app.delete("/diary/delete/:id", async (req, res) => {
  const { id, title, text } = req.params;
  await pool.query("DELETE FROM diarytable WHERE id = ?", [id]);
  const [data] = await pool.query(
    `SELECT id, title, text, 
  DATE_FORMAT(reg_date,'%Y-%m-%d') reg_date
  FROM diarytable 
  ORDER BY id DESC`
  );
  res.json(data);
});

app.patch("/diary/update/:id", async (req, res) => {
  const { id } = req.params;
  const { title, text } = req.query;
  await pool.query(
    `
    UPDATE diarytable
    SET title =?, TEXT = ?
    WHERE id = ?
    `,
    [title, text, id]
  );
  const [afterUpdate] = await pool.query(
    `
    SELECT id, title, text, 
    DATE_FORMAT(reg_date,'%Y-%m-%d') reg_date
    FROM diarytable 
    ORDER BY id DESC
    `
  );
  res.json(afterUpdate);
});

app.listen("4000", () => {
  console.log("app is listening");
});
