import { NextApiRequest, NextApiResponse } from "next";
import { pool } from "../../db/connect";
import AWS from "aws-sdk";
AWS.config.update({ region: "ap-south-1" });

type MemberType = {
  email: String;
  username: String;
};
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const { team_name, msg } = req.body;
  if (!team_name || !msg) throw new Error("Team name and msg are both needed");
  const q = `SELECT users.email, users.username
FROM team_members
INNER JOIN users ON team_members.user_id = users.user_id
INNER JOIN teams ON team_members.team_id = teams.team_id
WHERE teams.team_name = ?`;
  pool.getConnection(function (err, db) {
    if (err) return res.json(err);
    db.query(q, [team_name], (err, data) => {
      if (err) {
        return res.json({ err });
      }

      try {
        data.forEach((member: MemberType) => {
          return sendEmail(member.email + "", member.username + "", msg + ""); //""-> for String(wrapper)->string (pre-emptive)
        });
      } catch (err) {
        console.log(err);
        db.release();
        throw new Error(err);
      }
    });
  });
}

const sendEmail = async (toEmail: string, name: string, msg: string) => {
  const fromEmail = "nandan.vasista.bh@gmail.com";
  let params = {
    Destination: {
      ToAddresses: [
        toEmail,
        /* more items */
      ],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `<h3>Hi ${name}!</h3><br/>
<p><b> ${msg}</b></p><br/>
<p>Regards,<br/>
</p>`,
        },
        Text: {
          Charset: "UTF-8",
          Data: `Hi ${name}!`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Mail From Creater_content`,
      },
    },
    Source: fromEmail,
    ReplyToAddresses: [
      fromEmail,
      /* more items */
    ],
  };
  try {
    const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
      .sendEmail(params)
      .promise();

    sendPromise.catch(function (err) {
      console.error(err, err.stack);
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
