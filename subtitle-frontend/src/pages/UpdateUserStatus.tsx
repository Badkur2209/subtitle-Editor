import React, { useState } from "react";

// Dummy users array
const DUMMY_USERS = [
  {
    id: 1,
    username: "ramesh",
    email: "ramesh@example.com",
    langPairs: ["hi_en", "hi_mr"],
    roles: ["translator", "reviewer"],
    status: "active"
  },
  {
    id: 2,
    username: "sneha",
    email: "sneha@example.com",
    langPairs: ["hi_bn"],
    roles: ["uploader", "assigner"],
    status: "inactive"
  },
  {
    id: 3,
    username: "ajay",
    email: "ajay@example.com",
    langPairs: ["en_hi"],
    roles: ["approver", "admin"],
    status: "active"
  },
];

const UpdateUserStatus = () => {
  const [users, setUsers] = useState(DUMMY_USERS);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [status, setStatus] = useState(""); // for controlled status selection

  // Find the selected user object
  const selectedUser = users.find(u => u.id === parseInt(selectedUserId));

  // Handle user change
  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    const user = users.find(u => u.id === parseInt(userId));
    setStatus(user ? user.status : "");
  };

  // Handle status update
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  // Handle save/apply update
  const handleUpdateStatus = () => {
    if (!selectedUser) return;
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status } : u));
    alert(`User "${selectedUser.username}" status updated to "${status}"!`);
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Update User Status</h2>

      {/* Select User */}
      <label className="block mb-2 font-medium">Select User</label>
      <select
        className="w-full p-2 border rounded mb-4"
        value={selectedUserId}
        onChange={handleUserChange}
      >
        <option value="">-- Select a user --</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.username} ({user.email})
          </option>
        ))}
      </select>

      {/* Show details & status controls if a user is selected */}
      {selectedUser && (
        <div className="mb-4 bg-gray-50 rounded p-4 border">
          <div>
            <strong>Username:</strong> {selectedUser.username}
          </div>
          <div>
            <strong>Email:</strong> {selectedUser.email}
          </div>
          <div>
            <strong>Language Pairs:</strong> {selectedUser.langPairs.join(", ")}
          </div>
          <div>
            <strong>Roles:</strong> {selectedUser.roles.join(", ")}
          </div>
          <div className="mt-3">
            <label className="font-medium mr-2">Status:</label>
            <select
              className="p-1 border rounded"
              value={status}
              onChange={handleStatusChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleUpdateStatus}
          >
            Update Status
          </button>
        </div>
      )}

      {/* List users (optional table for quick reference) */}
      <div>
        <h3 className="font-semibold mb-2">All Users</h3>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-1">Username</th>
              <th className="border p-1">Email</th>
              <th className="border p-1">Language Pairs</th>
              <th className="border p-1">Roles</th>
              <th className="border p-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="border px-2 py-1">{u.username}</td>
                <td className="border px-2 py-1">{u.email}</td>
                <td className="border px-2 py-1">{u.langPairs.join(", ")}</td>
                <td className="border px-2 py-1">{u.roles.join(", ")}</td>
                <td className={`border px-2 py-1 ${u.status === "active" ? "text-green-600" : "text-red-600"}`}>
                  {u.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UpdateUserStatus;
