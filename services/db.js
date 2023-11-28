const sqlite3 = require('sqlite3').verbose();


async function query(query, page = 1, pageSize = 15) {
    const offset = (page - 1) * pageSize;

    return new Promise((resolve, reject) => {
        let db = new sqlite3.Database('./services/exercises.db', sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            console.log('Connected to the exercises database.');
        });

        db.all(`${query} LIMIT ? OFFSET ?`, [pageSize, offset], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                // close the database connection
                db.close();

                // resolve the promise with the array of rows
                resolve(rows);
            }
        });
    });
}
module.exports = { query }