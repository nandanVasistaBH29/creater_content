import { pool } from "../../../db/connect";
import CryptoJS from "crypto-js";
const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-south-1" });

function generateOTP() {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}
const sendEmail = async (toEmail, name, otp) => {
  const fromEmail = "nandan.vasista.bh@gmail.com";
  let params = {
    Destination: {
      /* required */
      ToAddresses: [
        toEmail,
        /* more items */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: `<h3>Hi ${name}!</h3><br/>
<p>Your OTP for Something Something Service Hub is:<em> ${otp}</em></p><br/>
<p>Regards,<br/>
Something Something Service Hub Team</p>`,
        },
        Text: {
          Charset: "UTF-8",
          Data: `Hi  ${name}!
Your Login OTP is ${otp}`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `${otp} is the  OTP for Something Something Service Hub!`,
      },
    },
    Source: fromEmail,
    /* required */
    ReplyToAddresses: [
      fromEmail,
      /* more items */
    ],
  };
  try {
    const sendPromise = new AWS.SES({ apiVersion: "2010–12–01" })
      .sendEmail(params)
      .promise();

    sendPromise
      .then(function (data) {
        console.log(data.MessageId);
      })
      .catch(function (err) {
        console.error(err, err.stack);
      });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default function handler(req, res) {
  const { username, email } = req.body;
  console.log(username);
  if (!username || !email) throw new Error("Please Enter All The Details");
  let q = `select * from users where email = ?`;
  pool.getConnection(function (err, db) {
    if (err) return res.json(err);
    db.query(q, [req.body.email], (err, data) => {
      if (err) {
        return res.json({ err });
      }
      if (data.length) {
        db.release();
        return res.status(409).json("user already exists");
      }
      const gen_otp = generateOTP();
      console.log(gen_otp);
      try {
        sendEmail(email, username, gen_otp);
      } catch (err) {
        console.log(err);
        db.release();
        throw new Error(err);
      }
      // Encrypt OTP
      const encryptedOTP = CryptoJS.AES.encrypt(
        gen_otp,
        process.env.SECRET_KEY_ENC
      ).toString();
      res.status(201).json({
        encryptedOTP: encryptedOTP,
      });
    });
  });
}
