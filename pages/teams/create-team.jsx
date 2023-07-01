import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const CreateTeamPage = () => {
  const [teamName, setTeamName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleCreateTeam = async () => {
    const ownerId = localStorage.getItem("creater-content-user_id");
    if (ownerId)
      try {
        const response = await axios.post("/api/teams/create-team", {
          teamName,
          ownerId,
        });
        console.log(response.data);
        if (response.data.err) {
          setErrorMessage("TEAM name must be globally unique");
        } else router.push("./add-member?team_name=" + teamName);
      } catch (error) {
        console.error(error);
        setErrorMessage("Failed to create team. Please try again." + error);
      }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Team</h1>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      <div className="mb-4">
        <label htmlFor="teamName" className="block mb-2">
          Team Name:
        </label>
        <input
          type="text"
          id="teamName"
          className="border p-2 w-full"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />
      </div>

      <button
        className="bg-blue-500 text-white py-2 px-4 rounded"
        onClick={handleCreateTeam}
        disabled={!teamName}
      >
        Create Team
      </button>
    </div>
  );
};

export default CreateTeamPage;
