// UserInfoPage.tsx
import React, { useState, useEffect, FormEvent } from "react";
import { API_BASE_URL } from "@/utils/config.ts";
type UserInfo = {
  id: number;
  name: string;
  username: string;
  password?: string; // Optional for display
  langPairs: string[];
  roles: string[];
  status: string;
};

const LANG_PAIR_OPTIONS = ["hi_en", "hi_mr", "hi_bn", "en_hi", "mr_en"];
const ROLE_OPTIONS = [
  "translator",
  "uploader",
  "reviewer",
  "assigner",
  "approver",
  "admin",
];

const initialForm = {
  name: "",
  username: "",
  password: "",
  langPairs: [] as string[],
  roles: [] as string[],
  status: "active",
};

// Password validation function
const validatePassword = (password: string): string => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/(?=.*\d)/.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    return "Password must contain at least one special character.";
  }
  return "";
};

const UserInfoPage: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Load users on mount
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/users`
          // "http://localhost:5000/api/users"
        );
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (err) {
        // Ignore
        console.log(err);
      }
    }
    fetchUsers();
  }, []);

  // Helpers
  const resetForm = () => {
    setForm(initialForm);
    setError("");
    setPasswordError("");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Clear password error when user types
    if (name === "password") {
      setPasswordError("");
    }

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({
        ...prev,
        [name]: checked
          ? [...(prev as any)[name], value]
          : (prev as any)[name].filter((item: string) => item !== value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !form.name.trim() ||
      !form.username.trim() ||
      !form.password.trim() ||
      form.langPairs.length === 0 ||
      form.roles.length === 0
    ) {
      setError("All fields are required.");
      return;
    }

    // Password validation
    const passwordValidationError = validatePassword(form.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    // Check for existing username
    if (users.some((u) => u.username === form.username)) {
      setError("Username already exists.");
      return;
    }

    // Send to backend
    try {
      const res = await fetch(
        // "http://localhost:5000/api/users"
        `${API_BASE_URL}/users`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) {
        const { error } = await res.json();
        setError(error || "Failed to create user.");
        return;
      }
      const { user } = await res.json();
      setUsers((prev) => [...prev, user]);
      resetForm();
    } catch {
      setError("Network/server error.");
    }
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        User Information
      </h1>
      <p className="text-gray-600 mb-6">
        Manage user profiles and account information.
      </p>

      <div className="mb-8 p-4 bg-gray-50 rounded shadow">
        <form onSubmit={handleCreateUser}>
          <h2 className="text-lg font-semibold mb-4">Create New User</h2>
          {error && <div className="mb-2 text-red-600">{error}</div>}

          <div className="flex gap-4">
            {/* Name */}
            <div className="flex-1">
              <label className="block font-medium mb-1">Full Name</label>
              <input
                className="w-full p-2 border rounded mb-3"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                autoComplete="off"
                placeholder="Enter full name"
              />
            </div>

            {/* Username */}
            <div className="flex-1">
              <label className="block font-medium mb-1">Username</label>
              <input
                type="email"
                className="w-full p-2 border rounded mb-3"
                name="username"
                value={form.username}
                onChange={handleInputChange}
                autoComplete="off"
                placeholder="Enter username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="block font-medium mb-1">Password</label>
            <input
              className="w-1/2 p-2 border rounded"
              name="password"
              type="password"
              value={form.password}
              onChange={handleInputChange}
              autoComplete="off"
              placeholder="Enter password"
            />
            {passwordError && (
              <div className="mt-1 text-red-600 text-sm">{passwordError}</div>
            )}
            <div className="mt-1 text-gray-500 text-sm">
              Password must be 8+ characters with uppercase, lowercase, number,
              and special character
            </div>
          </div>

          {/* Language Pairs */}
          <label className="block font-medium mb-1">Language Pairs</label>
          <div className="flex flex-wrap gap-4 mb-3">
            {LANG_PAIR_OPTIONS.map((pair) => (
              <label key={pair} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="langPairs"
                  value={pair}
                  checked={form.langPairs.includes(pair)}
                  onChange={handleInputChange}
                />{" "}
                {pair}
              </label>
            ))}
          </div>

          {/* Roles */}
          <label className="block font-medium mb-1">Roles</label>
          <div className="flex flex-wrap gap-4 mb-3">
            {ROLE_OPTIONS.map((role) => (
              <label key={role} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="roles"
                  value={role}
                  checked={form.roles.includes(role)}
                  onChange={handleInputChange}
                />{" "}
                {role}
              </label>
            ))}
          </div>

          {/* Status */}
          <label className="block font-medium mb-1">Status</label>
          <select
            name="status"
            className="p-2 border rounded mb-4"
            value={form.status}
            onChange={handleInputChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Actions */}
          <div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create User
            </button>
            <button
              type="button"
              className="ml-3 px-4 py-2"
              onClick={resetForm}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* User List/Table */}
      <div>
        <h2 className="text-lg font-semibold mb-2">All Users</h2>
        <table className="w-full mb-2 border text-sm bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Username</th>
              {Array.from({ length: 4 }).map((_, i) => (
                <th key={i} className="border px-2 py-1">{`Lang Pair ${
                  i + 1
                }`}</th>
              ))}
              <th className="border px-2 py-1">Roles</th>
              <th className="border px-2 py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border px-2 py-1">{u.name || ""}</td>
                <td className="border px-2 py-1">{u.username}</td>
                {Array.from({ length: 4 }).map((_, i) => (
                  <td key={i} className="border px-2 py-1">
                    {u.langPairs?.[i] || "-"}
                  </td>
                ))}
                <td className="border px-2 py-1">
                  {(u.roles || []).join(", ")}
                </td>
                <td
                  className={`border px-2 py-1 ${
                    u.status === "active" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {u.status || "active"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-gray-500 text-center py-8">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default UserInfoPage;
