import axios from "axios";
import { useState } from "react";
import Link from "next/link";
const SendMail = () => {
  const [team_name, setTeam_name] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit() {
    try {
      const res = await axios.post("/api/mail", {
        team_name,
        msg,
      });
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-900 ">
      <div className="bg-white p-6 rounded shadow-md">
        <div className="flex items-center mb-4">
          <label htmlFor="team_name" className="mr-2 text-teal-500">
            Team Name:
          </label>
          <input
            type="text"
            id="team_name"
            value={team_name}
            maxLength={100}
            onChange={(e) => setTeam_name(e.target.value)}
            className="py-1 px-2 border rounded"
          />
        </div>
        <div className="flex items-center mb-4">
          <label htmlFor="description" className="mr-2 text-teal-500">
            Description:
          </label>
          <textarea
            id="msg"
            value={msg}
            maxLength={250}
            onChange={(e) => setMsg(e.target.value)}
            className="py-1 px-2 border rounded"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="bg-teal-500 text-white py-2 px-4 rounded mt-4 hover:bg-teal-600"
        >
          Send Mail
        </button>
        <br />
        <br />
        <Link
          className="bg-teal-500 text-white py-2 px-4 rounded mt-4
              hover:bg-teal-600"
          href={"/videos/list-videos"}
        >
          Mail To Team Members
        </Link>
      </div>
    </div>
  );
};

export default SendMail;
