import { pool } from "../../../db/connect";

export default function handler(req, res) {
  const { user_id } = req.query;
  const q = "select * from videos where uploader_id = ?";
  pool.getConnection(function (err, db) {
    if (err) return res.json(err);
    db.query(q, [user_id], (err, data) => {
      if (err) {
        console.log(err);
        db.release();
        return res.json({ err });
      }

      res.json({ videos: data });
    });
  });
}
