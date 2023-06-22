import { pool } from "../../db/connect.js";
export default function handler(req, res) {
  // res.status(200).json({ name: 'John Doe' })
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting MySQL connection from pool: ", err);
      return;
    }

    // Use the acquired connection for your database operations
    connection.query("SELECT * FROM users", (queryErr, results) => {
      connection.release(); // Release the connection back to the pool

      if (queryErr) {
        console.error("Error executing MySQL query: ", queryErr);
        return;
      }
      res.send(results);
      console.log("Query results:", results);
    });
  });
}
