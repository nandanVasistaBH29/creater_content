import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const RegisterUser = () => {
  const route = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const getOTP = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/get-otp-register", {
        username,
        email,
      });
      console.log(res.data.encryptedOTP);
      sessionStorage.setItem("encryptedOTP", res.data.encryptedOTP);
      sessionStorage.setItem("email", email);
      sessionStorage.setItem("username", username);
      route.push("/auth/register");

      //save this to session storage
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-4">Register User</h2>
        <div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full  text-gray-700  px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 font-bold mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2  text-gray-700   border rounded"
              required
            />
          </div>
          <button
            type="button"
            onClick={getOTP}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Get OTP
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;
