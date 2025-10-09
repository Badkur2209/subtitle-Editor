// src/config/permissions.ts

// Define the list of all available pages by their 'title' from the navigationItems array.
// This makes the mapping more readable than using URLs.
export const pages = {
  OVERVIEW: "Overview",
  ACTIVITIES: "Activities",
  PREDICTIONS_DAILY: "PredictionsDaily",
  PREDICTIONS_10_DAYS: "Predictions10Days",
  CORRECTION: "Correction", // This is the parent menu item
  CORRECTION_ACTIVITIES: "Activities", // Sub-item title
  CORRECTION_PREDICTION_DAILY: "Prediction Daily", // Sub-item title
  CORRECTION_PREDICTION_10_DAYS: "Prediction 10 Days", // Sub-item title
  TRANSLATE: "Translate",
  UPLOADER: "Uploader",
  TASK_STATUS: "Task Status",
  UPDATE_USER_STATUS: "Update User Status",
  TASK_ASSIGNMENT: "Task Assignment",
  STATS_YOUTUBE: "Stats Youtube",
  APPROVE: "Approve",
  USER_INFO: "User-info",
  VTT_FILES_STATS: "VTT files stats",
  SETTINGS: "Settings",
  HELP: "Help & Support",
};

// Define permissions for each role
// The 'admin' role is special; we'll grant it access to everything directly in the code.
export const permissions = {
  uploader: [pages.OVERVIEW, pages.UPLOADER, pages.TASK_STATUS],
  assigner: [
    pages.OVERVIEW,
    pages.TASK_ASSIGNMENT,
    pages.PREDICTIONS_DAILY,
    pages.PREDICTIONS_10_DAYS,
    pages.UPDATE_USER_STATUS,
    pages.TASK_STATUS,
    pages.USER_INFO,
  ],
  translator: [
    pages.OVERVIEW,
    pages.PREDICTIONS_DAILY,
    pages.PREDICTIONS_10_DAYS,
    pages.TRANSLATE,
    pages.TASK_STATUS,
  ],
  editor: [
    pages.OVERVIEW,
    pages.CORRECTION,
    pages.CORRECTION_ACTIVITIES,
    pages.CORRECTION_PREDICTION_DAILY,
    pages.CORRECTION_PREDICTION_10_DAYS,
    pages.TASK_STATUS,
  ],
  reviewer: [pages.OVERVIEW, pages.APPROVE, pages.TASK_STATUS],
  // Admin will have access to all pages by default
};
