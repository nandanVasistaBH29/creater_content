import { pool } from "../../../db/connect";

export default function handler(req, res) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting MySQL connection from pool: ", err);
      return;
    }

    const q =
      "SELECT u.user_id, u.username, u.email, du.access FROM document_users AS du JOIN users AS u ON du.user_id = u.user_id WHERE du.doc_id = ?";
    connection.query(q, req.query.doc_id, (err, data) => {
      if (err || data.length === 0) {
        connection.release();
        console.log(err);
        console.log(data);
        res.status(500).json({ err: "internal server error " });
      }
      connection.release();
      res.status(200).json({ data: data });
    });
  });
}
