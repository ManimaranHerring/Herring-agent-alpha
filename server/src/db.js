import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'ongil_agent',
  connectionLimit: 10
});

export async function ensureTables() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        type VARCHAR(50),
        content JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        agent VARCHAR(50),
        input_json JSON,
        output_json JSON,
        status VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS harmonized_data (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        entity_type VARCHAR(50),
        data_json JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } finally {
    conn.release();
  }
}

export default {
  execute: (sql, params=[]) => pool.execute(sql, params),
  query:   (sql, params=[]) => pool.query(sql, params),
  pool
};
