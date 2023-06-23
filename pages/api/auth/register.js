import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";

import { pool } from "../../../db/connect";
import jwt from "jsonwebtoken";

export default function handler(req, res) {
  const { username, email, encOTP, otp } = req.body;
  console.log(email);
  if (verifyOTP(encOTP, otp)) {
    console.log("success");
    const q = "select * from users where email=?";
    pool.getConnection(function (err, db) {
      if (err) return res.json(err);
      db.query(q, [req.body.email], (err, data) => {
        if (err) {
          console.log(err);
          db.release();
          return res.json({ err });
        }
        if (data.length) return res.status(409).json("user already exists");
        // hash the password

        const q = "insert into users(user_id,username,email) values (?)";
        const values = [uuidv4(), username, email];
        db.query(q, [values], (err, data) => {
          if (err) {
            db.release();
            return res.json({ err });
          }
          //using jwt
          const token = jwt.sign(
            { id: Math.round(Math.random() * 10000) },
            process.env.JWT_SECRET
          );

          db.release();
          return res.status(200).json({ token });
        });
      });
    });
  }
}
const verifyOTP = (encOTP, otp) => {
  const decOTP = CryptoJS.AES.decrypt(
    encOTP,
    process.env.SECRET_KEY_ENC
  ).toString(CryptoJS.enc.Utf8);
  if (otp === decOTP) {
    return true;
  } else {
    return false;
  }
};
