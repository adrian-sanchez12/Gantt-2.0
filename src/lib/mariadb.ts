import mariadb from "mariadb";

const pool = mariadb.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: Number(process.env.DATABASE_PORT),
  connectionLimit: 5, 
});

export async function query(sql: string, values?: any[]) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(sql, values);
    return rows;
  } catch (error) {
    console.error("Error en la consulta:", error);
    throw error;
  } finally {
    if (conn) conn.end();
  }
}

export default pool;

