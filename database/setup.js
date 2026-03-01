const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'university.db');
const db = new sqlite3.Database(dbPath, (error) => {
	if (error) {
		console.error('Error opening database:', error.message);
		return;
	}

	console.log('Connected to SQLite database.');
});

db.serialize(() => {
	db.run(
		`CREATE TABLE IF NOT EXISTS courses (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			department TEXT NOT NULL,
			credits INTEGER NOT NULL
		)`,
		(error) => {
			if (error) {
				console.error('Error creating courses table:', error.message);
				return;
			}

			console.log('courses table created successfully.');
		}
	);
});

db.close((error) => {
	if (error) {
		console.error('Error closing database:', error.message);
		return;
	}

	console.log('Database connection closed.');
});
