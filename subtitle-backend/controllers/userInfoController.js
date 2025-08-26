// userInfoController.js
import User from "../models/User.js";

// Helper: flatten array fields to individual columns
function mapFormToModel(body) {
  const { name, username, password, langPairs, roles, status } = body;
  // Picking up to 4 lang pairs, filling null when not provided
  const [lang_pair1, lang_pair2, lang_pair3, lang_pair4] = [
    ...langPairs,
    null,
    null,
    null,
    null,
  ];
  // For this model, only one role field is present, pick the first role
  const role = roles && roles.length ? roles[0] : "translator";

  return {
    name,
    username,
    password,
    lang_pair1,
    lang_pair2,
    lang_pair3,
    lang_pair4,
    role,
    // other fields as needed (e.g. status, created_at)
  };
}

// Helper: Transform database user to frontend format
function transformUserForFrontend(dbUser) {
  const langPairs = [
    dbUser.lang_pair1,
    dbUser.lang_pair2,
    dbUser.lang_pair3,
    dbUser.lang_pair4,
  ].filter((pair) => pair !== null && pair !== undefined); // Remove null/undefined values

  return {
    id: dbUser.id,
    name: dbUser.name,
    username: dbUser.username,
    langPairs: langPairs,
    roles: [dbUser.role], // Convert single role to array
    status: dbUser.status || "active",
  };
}

export async function getUsers(req, res) {
  try {
    const users = await User.findAll();
    const transformedUsers = users.map((user) =>
      transformUserForFrontend(user)
    );
    res.json({ users: transformedUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createUser(req, res) {
  try {
    const data = mapFormToModel(req.body);
    const user = await User.create(data);
    const transformedUser = transformUserForFrontend(user);
    res.status(201).json({ message: "User created", user: transformedUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
