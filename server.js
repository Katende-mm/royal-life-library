const express = require("express");

const sqlite3 = require("sqlite3").verbose();

const bodyParser = require("body-parser");

const cors = require("cors");

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(express.static("public"));

const db = new sqlite3.Database("database.db");

// ==========================
// CREATE TABLES
// ==========================

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS books (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            subject TEXT,

            pace_number TEXT,

            grade TEXT,

            quantity INTEGER,

            type TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS borrows (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            book_id INTEGER,

            borrower TEXT,

            borrow_date TEXT,

            due_date TEXT,

            returned INTEGER DEFAULT 0
        )
    `);
});

// ==========================
// GET MATERIALS
// ==========================

app.get("/books", (req, res) => {

    db.all(
        "SELECT * FROM books",

        [],

        (err, rows) => {

            if (err) {

                console.error(err);

                return;
            }

            res.json(rows);
        }
    );
});

// ==========================
// ADD MATERIAL
// ==========================

app.post("/books", (req, res) => {

    const {

        subject,
        pace_number,
        grade,
        quantity,
        type

    } = req.body;

    db.run(

        `INSERT INTO books
        (subject, pace_number, grade, quantity, type)

        VALUES (?, ?, ?, ?, ?)`,

        [
            subject,
            pace_number,
            grade,
            quantity,
            type
        ],

        function(err) {

            if (err) {

                console.error(err);

                return;
            }

            res.json({
                success: true
            });
        }
    );
});

// ==========================
// BORROW
// ==========================

app.post("/borrow/:id", (req, res) => {

    const {

        borrower

    } = req.body;

    const borrowDate = new Date();

    const dueDate = new Date();

    dueDate.setDate(
        borrowDate.getDate() + 7
    );

    db.run(

        `INSERT INTO borrows
        (book_id, borrower, borrow_date, due_date)

        VALUES (?, ?, ?, ?)`,

        [
            req.params.id,
            borrower,
            borrowDate.toISOString(),
            dueDate.toISOString()
        ]
    );

    db.run(

        `UPDATE books

        SET quantity = quantity - 1

        WHERE id = ?

        AND quantity > 0`,

        [req.params.id]
    );

    res.json({
        success: true
    });
});

// ==========================
// RETURN
// ==========================

app.post("/return/:id", (req, res) => {

    db.run(

        `UPDATE borrows

        SET returned = 1

        WHERE book_id = ?

        AND returned = 0`,

        [req.params.id]
    );

    db.run(

        `UPDATE books

        SET quantity = quantity + 1

        WHERE id = ?`,

        [req.params.id]
    );

    res.json({
        success: true
    });
});

// ==========================
// START SERVER
// ==========================

app.listen(3000, "0.0.0.0", () => {

    console.log(
        "ACE Inventory System Running"
    );
});