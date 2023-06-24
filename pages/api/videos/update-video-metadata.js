import { pool } from "../../../db/connect";

export default function handler(req, res) {
  const { video_id } = req.query;
  console.log("meta data for" + video_id);
  let q = "";

  if (req.body.view_count)
    q = "UPDATE videos SET view_count = view_count + 1 WHERE video_id = ?;";
  else if (req.body.dis_likes)
    q = "UPDATE videos SET dis_likes = dis_likes + 1 WHERE video_id = ?;";
  else if (req.body.likes)
    q = "UPDATE videos SET likes = likes + 1 WHERE video_id = ?;";
  else throw new Error("invalid update");

  pool.getConnection(function (err, db) {
    if (err) return res.json(err);
    db.query(q, [video_id], (err, data) => {
      if (err) {
        console.log(err);
        db.release();
        return res.json({ err });
      }

      res.json({
        success: "Meta Data reterived successfully",
        data: data[0],
      });
    });
  });
}
