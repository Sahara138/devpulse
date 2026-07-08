import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function test() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log(result.rows);
  } catch (err) {
    console.error(err);
  }
}

test();