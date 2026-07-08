import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.connection_string,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const initDB = async () => {
  try {
    // Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'contributor',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Issues Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'open',
        reporter_id INT NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }};


// CREATE TABLE IF NOT EXISTS users (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(255) NOT NULL,
//         email VARCHAR(255) UNIQUE NOT NULL,
//         password TEXT NOT NULL,
//         role VARCHAR(20) NOT NULL DEFAULT 'contributor'
//           CHECK (role IN ('contributor', 'maintainer')),
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       );

//  CREATE TABLE IF NOT EXISTS issues (
//         id SERIAL PRIMARY KEY,
//         title VARCHAR(150) NOT NULL,
//         description TEXT NOT NULL,
//           // CHECK (char_length(description) >= 20),
//         type VARCHAR(20) NOT NULL
//           CHECK (type IN ('bug', 'feature_request')),
//         status VARCHAR(20) NOT NULL DEFAULT 'open'
//           CHECK (status IN ('open', 'in_progress', 'resolved')),
//         reporter_id INT NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//  )