const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const dbPath = path.join(__dirname, 'database', 'university.db');
const db = new sqlite3.Database(dbPath, (error) => {
	if (error) {
		console.error('Error connecting to database:', error.message);
		return;
	}

	console.log('Connected to university.db.');
});

app.get('/api/courses', (req, res) => {
	db.all('SELECT * FROM courses', [], (error, rows) => {
		if (error) {
			res.status(500).json({ error: error.message });
			return;
		}

		res.status(200).json(rows);
	});
});

app.get('/api/courses/:id', (req, res) => {
	const courseId = Number.parseInt(req.params.id, 10);

	if (Number.isNaN(courseId)) {
		res.status(400).json({ error: 'Invalid course ID.' });
		return;
	}

	db.get('SELECT * FROM courses WHERE id = ?', [courseId], (error, row) => {
		if (error) {
			res.status(500).json({ error: error.message });
			return;
		}

		if (!row) {
			res.status(404).json({ error: 'Course not found.' });
			return;
		}

		res.status(200).json(row);
	});
});

app.post('/api/courses', (req, res) => {
	const { name, department, credits } = req.body;

	if (!name || !department || typeof credits !== 'number') {
		res.status(400).json({
			error: 'name, department, and numeric credits are required.'
		});
		return;
	}

	const sql = 'INSERT INTO courses (name, department, credits) VALUES (?, ?, ?)';
	db.run(sql, [name, department, credits], function (error) {
		if (error) {
			res.status(500).json({ error: error.message });
			return;
		}

		res.status(201).json({
			id: this.lastID,
			name,
			department,
			credits
		});
	});
});

app.put('/api/courses/:id', (req, res) => {
	const courseId = Number.parseInt(req.params.id, 10);
	const { name, department, credits } = req.body;

	if (Number.isNaN(courseId)) {
		res.status(400).json({ error: 'Invalid course ID.' });
		return;
	}

	if (!name || !department || typeof credits !== 'number') {
		res.status(400).json({
			error: 'name, department, and numeric credits are required.'
		});
		return;
	}

	const sql = 'UPDATE courses SET name = ?, department = ?, credits = ? WHERE id = ?';
	db.run(sql, [name, department, credits, courseId], function (error) {
		if (error) {
			res.status(500).json({ error: error.message });
			return;
		}

		if (this.changes === 0) {
			res.status(404).json({ error: 'Course not found.' });
			return;
		}

		res.status(200).json({ id: courseId, name, department, credits });
	});
});

app.delete('/api/courses/:id', (req, res) => {
	const courseId = Number.parseInt(req.params.id, 10);

	if (Number.isNaN(courseId)) {
		res.status(400).json({ error: 'Invalid course ID.' });
		return;
	}

	db.run('DELETE FROM courses WHERE id = ?', [courseId], function (error) {
		if (error) {
			res.status(500).json({ error: error.message });
			return;
		}

		if (this.changes === 0) {
			res.status(404).json({ error: 'Course not found.' });
			return;
		}

		res.status(200).json({ message: 'Course deleted successfully.' });
	});
});

const server = app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', () => {
	db.close((error) => {
		if (error) {
			console.error('Error closing database:', error.message);
		} else {
			console.log('Database connection closed.');
		}

		server.close(() => {
			process.exit(0);
		});
	});
});
