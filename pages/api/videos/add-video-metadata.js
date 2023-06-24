import { pool } from "../../../db/connect";

export default function handler(req, res) {
  const { video_id, user_id, title, description } = req.body;
  const q =
    "insert into videos(video_id,title,description,uploader_id) values (?,?,?,?)";
  pool.getConnection(function (err, db) {
    if (err) return res.json(err);
    db.query(q, [video_id, title, description, user_id], (err, data) => {
      if (err) {
        console.log(err);
        db.release();
        return res.json({ err });
      }

      res.json({ success: "Meta Data added successfully" });
    });
  });
}
