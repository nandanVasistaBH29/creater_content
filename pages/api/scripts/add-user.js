import { pool } from "../../../db/connect";

export default function handler(req, res) {
  pool.getConnection(async (err, connection) => {
    if (err) {
      console.error("Error getting MySQL connection from pool: ", err);
      return;
    }
    const insertQuery =
      "INSERT INTO document_users (user_id, doc_id, access) VALUES (?, ?, ?)";
    connection.query(
      insertQuery,
      [req.body.user_id, req.body.doc_id, req.body.access],
      (err, data) => {
        if (err) {
          console.error("Error querying user:", err);
          connection.release();
          res.status(500).json({ message: "Internal Server Error" });
          return;
        }
        connection.release();
        res.status(200).json({ team: data });
      }
    );
  });
}
