import { pool } from "../../../db/connect";

export default function handler(req, res) {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting MySQL connection from pool: ", err);
      return;
    }

    const q = "select * from documents where doc_id = ?";
    connection.query(q, req.body.doc_id, (err, data) => {
      if (err || data.length > 1) {
        connection.release();
        console.log(err);
        console.log(data);
        res.status(500).json({ err: "internal server error " });
      }
      if (data.length === 1) {
        connection.release();
        res.status(200).json({ data: data[0] });
      }
      if (data.length == 0) {
        connection.release();
        console.log(data);
        res.status(200).json({ err: "Click on Save and create a new one" });
      }
    });
  });
}
