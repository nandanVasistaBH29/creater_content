import { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../../db/connect";

export default async function addUserToTeamHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const { email, team_name, role, owner_id_team } = req.body;

  try {
    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
      }

      // Verify if the user exists
      const checkUserQuery = "SELECT * FROM users WHERE email = ?";
      connection.query(checkUserQuery, [email], (err, userResult) => {
        if (err) {
          console.error("Error querying user:", err);
          connection.release();
          res.status(500).json({ message: "Internal Server Error" });
          return;
        }

        if (userResult.length === 0) {
          connection.release();
          return;
        }
        const user_id = userResult[0].user_id;

        const getTeamQuery =
          "SELECT team_id,owner_id FROM teams WHERE team_name = ? ";
        connection.query(getTeamQuery, [team_name], (err, teamResult) => {
          if (err) {
            console.error("Error querying team:", err);
            connection.release();
            res.status(500).json({ message: "Internal Server Error" });
            return;
          }

          if (teamResult.length !== 1) {
            connection.release();
            res.status(404).json({
              message: "Team not found or team name is matching with others",
            });
            return;
          }

          const { team_id, owner_id } = teamResult[0];
          console.log(owner_id, owner_id_team);
          if (owner_id !== owner_id_team) {
            connection.release();
            res.status(403).json({
              message: "Only the owner of the team can add users to the team",
            });
            return;
          }

          // Insert the user into the team_members table
          const addUserToTeamQuery =
            "INSERT INTO team_members (team_id, user_id,role) VALUES (?, ?,?)";
          connection.query(
            addUserToTeamQuery,
            [team_id, user_id, role],
            (err) => {
              if (err) {
                console.error("Error adding user to team:", err);
                connection.release();
                res.status(500).json({ message: "Internal Server Error" });
                return;
              }

              connection.release();
              res.status(200).json({ success: "User added to team" });
            }
          );
        });
      });
    });
  } catch (error) {
    console.error("Error adding user to team:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
