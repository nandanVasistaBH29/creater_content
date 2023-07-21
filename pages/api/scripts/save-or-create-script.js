import { pool } from "../../../db/connect";

export default function handler(req, res) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting MySQL connection from pool: ", err);
      return;
    }
    const selectQuery = "SELECT * FROM documents WHERE doc_id = ?";
    connection.query(selectQuery, [req.body.doc_id], (err, data) => {
      if (err || !data || data.length > 1) {
        console.error("Error querying user:", err);
        connection.release();
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }

      if (data.length === 1) {
        const updateQuery =
          "UPDATE documents SET content = ?, updated_at = NOW() WHERE doc_id = ?;";
        connection.query(
          updateQuery,
          [req.body.content, req.body.doc_id],
          (err, update_data) => {
            if (err || update_data.affectedRows !== 1) {
              connection.release();
              console.log(err);
              res.status(500).json({ err: "Internal server error" });
              return;
            }
            connection.release();
            res.status(200).json({ document: update_data[0] });
          }
        );
      }
      if (data.length === 0) {
        const insertQuery =
          "INSERT INTO documents (doc_id, title, content) VALUES (?, ?, ?)";

        connection.query(
          insertQuery,
          [req.body.doc_id, req.body.title, req.body.content],
          (err, insert_data) => {
            if (err || insert_data.affectedRows !== 1) {
              console.log(err);
              connection.release();
              res.status(500).json({ message: "Internal Server Error" });
              return;
            }
            connection.release();
            res.status(200).json({ document: insert_data });
          }
        );
      }
    });
  });
}
