const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'university.db');
const db = new sqlite3.Database(dbPath, (error) => {
	if (error) {
		console.error('Error connecting to database:', error.message);
		return;
	}

	console.log('Connected to university.db.');
});

const closeDatabase = () => {
	db.close((error) => {
		if (error) {
			console.error('Error closing database connection:', error.message);
			return;
		}

		console.log('Database connection closed.');
	});
};

const courses = [
	['Introduction to Computer Science', 'Computer Science', 3],
	['Data Structures', 'Computer Science', 4],
	['Calculus I', 'Mathematics', 4],
	['English Composition', 'English', 3],
	['General Physics', 'Physics', 4]
];

db.serialize(() => {
	db.run('DELETE FROM courses', (error) => {
		if (error) {
			console.error('Error clearing existing course data:', error.message);
			closeDatabase();
			return;
		}

		const insertCourse = db.prepare(
			'INSERT INTO courses (name, department, credits) VALUES (?, ?, ?)'
		);

		courses.forEach((course) => {
			insertCourse.run(course[0], course[1], course[2]);
		});

		insertCourse.finalize((finalizeError) => {
			if (finalizeError) {
				console.error('Error inserting courses:', finalizeError.message);
				closeDatabase();
				return;
			}

			console.log('Values were successfully added to the database.');
			closeDatabase();
		});
	});
});
