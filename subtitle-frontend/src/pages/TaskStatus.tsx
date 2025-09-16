import React from "react";

type TaskStatus = {
  user: string;
  role: string;
  status: "Pending" | "Success" | "In Progress";
  vttFiles: number;
  pending: number;
  success: number;
  inProgress: number;
  hours: number;
};

const dummyData: TaskStatus[] = [
  {
    user: "Anil Sharma",
    role: "Translator",
    status: "In Progress",
    vttFiles: 5,
    pending: 2,
    success: 1,
    inProgress: 2,
    hours: 3.5,
  },
  {
    user: "Priya Verma",
    role: "Reviewer",
    status: "Success",
    vttFiles: 10,
    pending: 0,
    success: 10,
    inProgress: 0,
    hours: 6,
  },
  {
    user: "Ravi Kumar",
    role: "Translator",
    status: "Pending",
    vttFiles: 3,
    pending: 3,
    success: 0,
    inProgress: 0,
    hours: 1.5,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Success":
      return "text-green-600 bg-green-100";
    case "Pending":
      return "text-yellow-600 bg-yellow-100";
    case "In Progress":
      return "text-blue-600 bg-blue-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const UserManagement: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6">Task Status</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-gray-600 uppercase tracking-wider">
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">VTT Files</th>
              <th className="px-4 py-2">Pending</th>
              <th className="px-4 py-2">Success</th>
              <th className="px-4 py-2">In Progress</th>
              <th className="px-4 py-2">Hours</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {dummyData.map((task, idx) => (
              <tr
                key={idx}
                className="bg-white even:bg-gray-50 hover:shadow transition"
              >
                <td className="px-4 py-3 font-medium">{task.user}</td>
                <td className="px-4 py-3">{task.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="px-4 py-3">{task.vttFiles}</td>
                <td className="px-4 py-3">{task.pending}</td>
                <td className="px-4 py-3">{task.success}</td>
                <td className="px-4 py-3">{task.inProgress}</td>
                <td className="px-4 py-3">{task.hours}</td>
                <td className="px-4 py-3">
                  <button className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600 transition">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
