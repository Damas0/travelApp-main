/* eslint-disable */
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const upload = multer({ dest: path.join(__dirname, '../uploads') });

let db;
(async () => {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });
  await db.exec(`CREATE TABLE IF NOT EXISTS voyages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    titre TEXT,
    destination TEXT,
    dateDepart TEXT,
    dateRetour TEXT,
    imageUrl TEXT
  );`);
  await db.exec(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    voyageId INTEGER,
    type TEXT,
    data TEXT,
    FOREIGN KEY(voyageId) REFERENCES voyages(id) ON DELETE CASCADE
  );`);
})();

// Récupérer les voyages d'un utilisateur
app.get('/api/voyages', async (req, res) => {
  const { userId } = req.query;
  const voyages = await db.all('SELECT * FROM voyages WHERE userId = ?', userId);
  const items = await db.all('SELECT * FROM items');
  const formatted = voyages.map(v => ({
    ...v,
    items: items
      .filter(i => i.voyageId === v.id)
      .map(i => ({ type: i.type, data: JSON.parse(i.data) }))
  }));
  res.json(formatted);
});

// Récupérer le détail d'un voyage
app.get('/api/voyages/:id', async (req, res) => {
  const voyage = await db.get('SELECT * FROM voyages WHERE id = ?', req.params.id);
  if (!voyage) return res.status(404).json({ error: 'Not found' });
  const items = await db.all('SELECT * FROM items WHERE voyageId = ?', req.params.id);
  voyage.items = items.map(i => ({ type: i.type, data: JSON.parse(i.data) }));
  res.json(voyage);
});

// Création d'un voyage
app.post('/api/voyages', upload.single('image'), async (req, res) => {
  const { userId, titre, destination, dateDepart, dateRetour } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const result = await db.run(
    'INSERT INTO voyages (userId, titre, destination, dateDepart, dateRetour, imageUrl) VALUES (?, ?, ?, ?, ?, ?)',
    userId, titre, destination, dateDepart, dateRetour, imageUrl
  );
  const voyage = await db.get('SELECT * FROM voyages WHERE id = ?', result.lastID);
  voyage.items = [];
  res.json(voyage);
});

// Suppression d'un voyage
app.delete('/api/voyages/:id', async (req, res) => {
  await db.run('DELETE FROM voyages WHERE id = ?', req.params.id);
  await db.run('DELETE FROM items WHERE voyageId = ?', req.params.id);
  res.json({ success: true });
});

// Ajout d'un item à un voyage
app.post('/api/voyages/:id/items', async (req, res) => {
  const { type, data } = req.body;
  await db.run('INSERT INTO items (voyageId, type, data) VALUES (?, ?, ?)', req.params.id, type, JSON.stringify(data));
  const items = await db.all('SELECT * FROM items WHERE voyageId = ?', req.params.id);
  const formatted = items.map(i => ({ type: i.type, data: JSON.parse(i.data) }));
  res.json(formatted);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
