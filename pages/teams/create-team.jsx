import { useState } from "react";
import axios from "axios";

const CreateTeamPage = () => {
  const [teamName, setTeamName] = useState("");
  const [userInput, setUserInput] = useState("");
  const [role, setRole] = useState("");
  const [members, setMembers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateTeam = async () => {
    const ownerId = localStorage.getItem("creater-content-user_id");
    if (ownerId)
      try {
        const response = await axios.post("/api/teams/create-team", {
          teamName,
          ownerId,
        });
        console.log(response.data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Failed to create team. Please try again." + error);
      }
  };

  const handleAddMember = async () => {
    const ownerId = localStorage.getItem("creater-content-user_id");
    console.log(teamName);
    try {
      const response = await axios.post("/api/teams/add-user-to-team", {
        email: userInput,
        team_name: teamName,
        role,
        owner_id_team: ownerId,
      });

      // Handle successful member addition
      console.log(response.data);

      setMembers((prevMembers) => [
        ...prevMembers,
        { user_id: userInput, role },
      ]);

      setUserInput("");
      setRole("");
      setErrorMessage("");
    } catch (error) {
      // Handle error
      console.error(error);
      setErrorMessage("Failed to add member. Please try again.");
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

      <h2 className="text-xl font-bold mt-8 mb-4">Add Members</h2>
      <div className="mb-4">
        <label htmlFor="userInput" className="block mb-2">
          Team Members Email :
        </label>
        <input
          type="text"
          id="userInput"
          className="border p-2 w-full"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="role" className="block mb-2">
          Role:
        </label>
        <input
          type="text"
          id="role"
          className="border p-2 w-full"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded"
        onClick={handleAddMember}
        disabled={!userInput || !role}
      >
        Add Member
      </button>

      <h2 className="text-xl font-bold mt-8 mb-4">Team Members</h2>
      {members.length > 0 ? (
        <ul>
          {members.map((member, index) => (
            <li key={index}>{member.user_id}</li>
          ))}
        </ul>
      ) : (
        <p>No members added yet.</p>
      )}
    </div>
  );
};

export default CreateTeamPage;
