import { pool } from "../../../db/connect";

export default function handler(req, res) {
  const { video_id } = req.query;
  console.log("meta data for" + video_id);
  const q = "select * from videos where video_id = ?";
  pool.getConnection(function (err, db) {
    if (err) return res.json(err);
    db.query(q, [video_id], (err, data) => {
      if (err) {
        console.log(err);
        db.release();
        return res.json({ err });
      }

      res.json({ success: "Meta Data reterived successfully", data: data[0] });
    });
  });
}
