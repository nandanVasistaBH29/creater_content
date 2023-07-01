import { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../../db/connect";
import mysql, { PoolConnection } from "mysql";
export default async function createTeamHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }
  const { teamName, ownerId } = req.body;
  console.log(teamName, ownerId);

  const createTeamQuery =
    "INSERT INTO teams (team_name, owner_id) VALUES (?, ?)";

  try {
    pool.getConnection(function (
      err: mysql.MysqlError | null,
      db: PoolConnection
    ) {
      if (err) return res.json(err);
      db.query(
        createTeamQuery,
        [teamName, ownerId],
        (err: mysql.MysqlError | null, data) => {
          if (err) {
            console.log(err);
            db.release();
            return res.json({ err });
          }

          res.json({ success: "team is created" });
        }
      );
    });
  } catch (err) {
    console.log(err);
  }
}
