import XLSX from "xlsx";
import { sequelize } from "../db/index.js";
import PredictionDaily from "../models/predictionsData.js";

const importExcelData = async (filePath) => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log("Database connected successfully");

    // Sync the model (create table if it doesn't exist)
    await PredictionDaily.sync({ alter: true });
    console.log("Table synced successfully");

    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Found ${jsonData.length} rows to import`);

    // Clean and prepare data
    const cleanedData = jsonData.map((row, index) => {
      // Convert dates to proper format
      const formatDate = (dateValue) => {
        if (!dateValue) return null;

        // Handle Excel date serial numbers
        if (typeof dateValue === "number") {
          const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
          return excelDate.toISOString().split("T")[0]; // YYYY-MM-DD format
        }

        // Handle string dates
        if (typeof dateValue === "string") {
          const date = new Date(dateValue);
          return isNaN(date.getTime())
            ? dateValue
            : date.toISOString().split("T")[0];
        }

        return dateValue;
      };

      // Convert Excel time decimal to HH:MM:SS format
      const formatTime = (timeValue) => {
        if (!timeValue) return null;

        // If it's already a string in correct format, return as is
        if (typeof timeValue === "string" && timeValue.includes(":")) {
          return timeValue;
        }

        // If it's a decimal number (Excel time format)
        if (typeof timeValue === "number") {
          // Convert decimal to total seconds
          const totalSeconds = Math.round(timeValue * 24 * 60 * 60);

          // Calculate hours, minutes, seconds
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;

          // Format as HH:MM:SS
          return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }

        return timeValue;
      };

      // Convert duration format (if needed)
      const formatDuration = (durationValue) => {
        if (!durationValue) return null;

        // If it's already in HH:MM:SS format, return as is
        if (typeof durationValue === "string" && durationValue.includes(":")) {
          return durationValue;
        }

        // If it's a decimal, convert like time
        if (typeof durationValue === "number") {
          return formatTime(durationValue);
        }

        return durationValue;
      };

      return {
        type: row.type || null,
        fromdate: formatDate(row.fromdate),
        todate: formatDate(row.todate),
        subno: row.subno?.toString() || null,
        daycount: row.daycount?.toString() || null,
        url: row.url || null,
        totalduration: formatDuration(row.totalduration), // Format duration
        starttime: formatTime(row.starttime), // Format start time
        endtime: formatTime(row.endtime), // Format end time
        lagna_rasi: row.lagna_rasi || null,
        lrname: row.lrname || null,
        sentiment: row.sentiment || null,
        super_positive: row.super_positive || null,
        positive: row.positive || null,
        productive: row.productive || null,
        lucky: row.lucky || null,
        average: row.average || null,
        below_average: row.below_average || null,
        negative: row.negative || null,
        super_negative: row.super_negative || null,
        pending_work: row.pending_work || null,
        tiring_even: row.tiring_even || null,
        bhaag_daud: row.bhaag_daud || null,
        en_1: row.en_1 || null,
        en_2: row.en_2 || null,
        en_3: row.en_3 || null,
        en_4: row.en_4 || null,
        hi_1: row.hi_1 || null,
        hi_2: row.hi_2 || null,
        hi_3: row.hi_3 || null,
        hi_4: row.hi_4 || null,
        mr_1: row.mr_1 || null,
        mr_2: row.mr_2 || null,
        mr_3: row.mr_3 || null,
        mr_4: row.mr_4 || null,
        gu_1: row.gu_1 || null,
        gu_2: row.gu_2 || null,
        gu_3: row.gu_3 || null,
        gu_4: row.gu_4 || null,
        bn_1: row.bn_1 || null,
        bn_2: row.bn_2 || null,
        bn_3: row.bn_3 || null,
        bn_4: row.bn_4 || null,
        te_1: row.te_1 || null,
        te_2: row.te_2 || null,
        te_3: row.te_3 || null,
        te_4: row.te_4 || null,
        status: row.status || "pending",
        assigned_to: row.assigned_to || null,
        status_en: row.status_en || null,
        status_hi: row.status_hi || null,
        status_mr: row.status_mr || null,
        status_gu: row.status_gu || null,
        status_te: row.status_te || null,
        status_bn: row.status_bn || null,
      };
    });

    // Optional: Log a sample of converted data to verify
    console.log("Sample converted data:", cleanedData[0]);

    // Batch insert data
    console.log("Starting data import...");

    // Use bulkCreate for better performance
    const result = await PredictionDaily.bulkCreate(cleanedData, {
      ignoreDuplicates: true, // Skip duplicates if any
      validate: true,
    });

    console.log(`Successfully imported ${result.length} records`);

    // Close database connection
    await sequelize.close();
  } catch (error) {
    console.error("Error importing data:", error);
    await sequelize.close();
  }
};

// Usage
const filePath = "../storage/predictionsDailyData.xlsx";
importExcelData(filePath);

// below is storing the data but starttime and endtime is storing in different format 
// // importData.js
// import XLSX from "xlsx";
// import { sequelize } from "../db/index.js";
// import PredictionDaily from "../models/predictionsData.js";

// const importExcelData = async (filePath) => {
//   try {
//     // Connect to database
//     await sequelize.authenticate();
//     console.log("Database connected successfully");

//     // Sync the model (create table if it doesn't exist)
//     await PredictionDaily.sync({ alter: true });
//     console.log("Table synced successfully");

//     // Read Excel file
//     const workbook = XLSX.readFile(filePath);
//     const sheetName = workbook.SheetNames[0]; // Get first sheet
//     const worksheet = workbook.Sheets[sheetName];

//     // Convert to JSON
//     const jsonData = XLSX.utils.sheet_to_json(worksheet);
//     console.log(`Found ${jsonData.length} rows to import`);

//     // Clean and prepare data
//     const cleanedData = jsonData.map((row, index) => {
//       // Convert dates to proper format if needed
//       const formatDate = (dateValue) => {
//         if (!dateValue) return null;

//         // Handle Excel date serial numbers
//         if (typeof dateValue === "number") {
//           const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
//           return excelDate.toISOString().split("T")[0]; // YYYY-MM-DD format
//         }

//         // Handle string dates
//         if (typeof dateValue === "string") {
//           const date = new Date(dateValue);
//           return isNaN(date.getTime())
//             ? dateValue
//             : date.toISOString().split("T")[0];
//         }

//         return dateValue;
//       };

//       return {
//         type: row.type || null,
//         fromdate: formatDate(row.fromdate),
//         todate: formatDate(row.todate),
//         subno: row.subno?.toString() || null,
//         daycount: row.daycount?.toString() || null,
//         url: row.url || null,
//         totalduration: row.totalduration || null,
//         starttime: row.starttime || null,
//         endtime: row.endtime || null,
//         lagna_rasi: row.lagna_rasi || null,
//         lrname: row.lrname || null,
//         sentiment: row.sentiment || null,
//         super_positive: row.super_positive || null,
//         positive: row.positive || null,
//         productive: row.productive || null,
//         lucky: row.lucky || null,
//         average: row.average || null,
//         below_average: row.below_average || null,
//         negative: row.negative || null,
//         super_negative: row.super_negative || null,
//         pending_work: row.pending_work || null,
//         tiring_even: row.tiring_even || null,
//         bhaag_daud: row.bhaag_daud || null,
//         en_1: row.en_1 || null,
//         en_2: row.en_2 || null,
//         en_3: row.en_3 || null,
//         en_4: row.en_4 || null,
//         hi_1: row.hi_1 || null,
//         hi_2: row.hi_2 || null,
//         hi_3: row.hi_3 || null,
//         hi_4: row.hi_4 || null,
//         mr_1: row.mr_1 || null,
//         mr_2: row.mr_2 || null,
//         mr_3: row.mr_3 || null,
//         mr_4: row.mr_4 || null,
//         gu_1: row.gu_1 || null,
//         gu_2: row.gu_2 || null,
//         gu_3: row.gu_3 || null,
//         gu_4: row.gu_4 || null,
//         bn_1: row.bn_1 || null,
//         bn_2: row.bn_2 || null,
//         bn_3: row.bn_3 || null,
//         bn_4: row.bn_4 || null,
//         te_1: row.te_1 || null,
//         te_2: row.te_2 || null,
//         te_3: row.te_3 || null,
//         te_4: row.te_4 || null,
//         status: row.status || "pending",
//         assigned_to: row.assigned_to || null,
//         status_en: row.status_en || null,
//         status_hi: row.status_hi || null,
//         status_mr: row.status_mr || null,
//         status_gu: row.status_gu || null,
//         status_te: row.status_te || null,
//         status_bn: row.status_bn || null,
//       };
//     });

//     // Batch insert data
//     console.log("Starting data import...");

//     // Use bulkCreate for better performance
//     const result = await PredictionDaily.bulkCreate(cleanedData, {
//       ignoreDuplicates: true, // Skip duplicates if any
//       validate: true,
//     });

//     console.log(`Successfully imported ${result.length} records`);

//     // Close database connection
//     await sequelize.close();
//   } catch (error) {
//     console.error("Error importing data:", error);
//     await sequelize.close();
//   }
// };

// // Usage
// const filePath = "../storage/predictionsDailyData.xlsx"; // Replace with your actual file path
// importExcelData(filePath);
// importData.js
