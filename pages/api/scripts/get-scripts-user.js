import { pool } from "../../../db/connect";

export default function handler(req, res) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting MySQL connection from pool: ", err);
      return;
    }

    const q =
      "SELECT d.* FROM documents AS d INNER JOIN document_users AS du ON d.doc_id = du.doc_id WHERE du.user_id = ? AND du.access IN ('0', '1', '2');";
    connection.query(q, req.query.user_id, (err, data) => {
      if (err) {
        connection.release();
        console.log(err);
        res.status(500).json({ err: "internal server error " });
      }

      res.status(200).json({ data });
    });
  });
}
