import { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../../db/connect";

export default async function getTeamHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const { team_name } = req.query;

  try {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }

      const getTeamQuery = `
        SELECT teams.owner_id, team_members.*, users.username
        FROM teams
        INNER JOIN team_members ON teams.team_id = team_members.team_id
        LEFT JOIN users ON team_members.user_id = users.user_id
        WHERE teams.team_name = ?
      `;

      connection.query(getTeamQuery, [team_name], (err, result) => {
        if (err) {
          console.error("Error querying team:", err);
          connection.release();
          res.status(500).json({ message: "Internal Server Error" });
          return;
        }

        if (result.length === 0) {
          connection.release();
          res.status(404).json({ message: "Team not found" });
          return;
        }

        connection.release();
        res.status(200).json({ team: result });
      });
    });
  } catch (error) {
    console.error("Error retrieving team:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
