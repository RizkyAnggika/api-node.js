import express from 'express';
import mysql from 'mysql2';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import YAML from 'yaml';

const swaggerDocument = YAML.parse(fs.readFileSync('./user-api.yml', 'utf8'));

const db = mysql.createConnection({ 
    host: "localhost", 
    user: "root", 
    database: "db_api_praktikum", 
    password: "" 
});

const app = express();
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/users', (req, res) => {
    db.query('SELECT * FROM user', (err, results) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(results);
    });
});

app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM user WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }
        if (result.length === 0) {
            res.status(404).send('User tidak ditemukan');
            return;
        }
        res.json(result[0]);
    });
});

app.post('/users', (req, res) => {
    const { name, email, age } = req.body;

    if (!name || !email || !age) {
        res.status(400).send('Data tidak lengkap');
        return;
    }

    db.query(
        'INSERT INTO user (name, email, age) VALUES (?, ?, ?)',
        [name, email, age],
        (err, result) => {
            if (err) {
                res.status(500).send('Internal Server Error');
                return;
            }
            res.status(201).json({ message: 'User berhasil ditambahkan', id: result.insertId });
        }
    );
});

app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM user WHERE id = ?', [id], (err, result) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('User tidak ditemukan');
            return;
        }
        res.json({ message: 'User berhasil dihapus' });
    });
});

app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, age } = req.body;

    if (!name || !email || !age) {
        res.status(400).send('Data tidak lengkap');
        return;
    }

    db.query(
        'UPDATE user SET name = ?, email = ?, age = ? WHERE id = ?',
        [name, email, age, id],
        (err, result) => {
            if (err) {
                res.status(500).send('Internal Server Error');
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).send('User tidak ditemukan');
                return;
            }
            res.json({ message: 'User berhasil diperbarui' });
        }
    );
});

app.listen(3000, () => 
    console.log('Server berjalan di http://localhost:3000')
);
