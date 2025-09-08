const sqlite3 = require('sqlite3').verbose();

// Create/connect to database
const db = new sqlite3.Database('yourDatabase.db');



// Create users table if it doesn't exist
db.serialize(() => {
  // CREATE USER TABLE 
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
// CREATE USER-FAVORITES TABLE 
db.run(`CREATE TABLE IF NOT EXISTS user_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,      
    user_id INTEGER NOT NULL, 
    menu_item_id INTEGER NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, menu_item_id)
  )`)
  
});

module.exports = db;