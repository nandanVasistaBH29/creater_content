import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const Login = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOTP] = useState("");
  const [encOTP, setENCOTP] = useState("");
  const route = useRouter();

  useEffect(() => {
    try {
      setENCOTP(sessionStorage.getItem("encryptedOTP"));
      setEmail(sessionStorage.getItem("email"));
      setUsername(sessionStorage.getItem("username"));
      setTimeout(function () {
        sessionStorage.removeItem("encryptedOTP");
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("username");
      }, 2 * 60 * 1000); // 2 minutes in milliseconds
    } catch (err) {
      console.log(err);
    }
  }, []);
  const register_user = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", {
        username,
        email,
        encOTP,
        otp,
      });
      localStorage.setItem("creater-content-email", email);
      localStorage.setItem("creater-content-username", username);
      localStorage.setItem("creater-content-token", res.data.token);
      localStorage.setItem("creater-content-user_id", res.data.user_id);
      route.push("/videos/list-videos");
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-4">Login User</h2>
        <div className="mb-4">
          <label htmlFor="otp" className="block text-gray-700 font-bold mb-2">
            otp
          </label>
          <input
            type="text"
            id="username"
            value={otp}
            onChange={(e) => setOTP(e.target.value)}
            className="w-full px-3 py-2 border  text-gray-700  rounded"
            required
          />
        </div>
        <button
          type="button"
          onClick={register_user}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Verify And Register
        </button>
      </div>
    </div>
  );
};

export default Login;
