// ApproverScreen.tsx
import React, { useEffect, useState, useMemo } from "react";
import { API_BASE_URL } from "../utils/config.ts";

const LANG_KEYS = [
  { label: "English", key: "en" },
  { label: "Hindi", key: "hi" },
  { label: "Marathi", key: "mr" },
  { label: "Gujarati", key: "gu" },
  { label: "Bengali", key: "bn" },
  { label: "Telugu", key: "te" },
];

const LANGUAGE_COLUMNS_MAP = {
  en: ["en_1", "en_2", "en_3", "en_4"],
  hi: ["hi_1", "hi_2", "hi_3", "hi_4"],
  mr: ["mr_1", "mr_2", "mr_3", "mr_4"],
  gu: ["gu_1", "gu_2", "gu_3", "gu_4"],
  bn: ["bn_1", "bn_2", "bn_3", "bn_4"],
  te: ["te_1", "te_2", "te_3", "te_4"],
};

type Category =
  | "activity"
  | "predictionDaily"
  | "prediction10Days"
  | "translate";

interface ContentItem {
  id: number;
  fromdate?: string;
  todate?: string;
  lrname?: string;
  url?: string;
  assigned_to?: string;
  status_en?: string;
  status_hi?: string;
  status_mr?: string;
  status_gu?: string;
  status_bn?: string;
  status_te?: string;
  // Language columns
  en_1?: string;
  en_2?: string;
  en_3?: string;
  en_4?: string;
  hi_1?: string;
  hi_2?: string;
  hi_3?: string;
  hi_4?: string;
  mr_1?: string;
  mr_2?: string;
  mr_3?: string;
  mr_4?: string;
  gu_1?: string;
  gu_2?: string;
  gu_3?: string;
  gu_4?: string;
  bn_1?: string;
  bn_2?: string;
  bn_3?: string;
  bn_4?: string;
  te_1?: string;
  te_2?: string;
  te_3?: string;
  te_4?: string;
  [key: string]: any;
}

const categories: { label: string; value: Category }[] = [
  { label: "Activity", value: "activity" },
  { label: "Prediction Daily", value: "predictionDaily" },
  { label: "Prediction 10 Days", value: "prediction10Days" },
  { label: "Translate", value: "translate" },
];

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN");
  } catch {
    return dateString;
  }
};

const parseDMYDate = (dmyStr: string) => {
  if (!dmyStr) return null;
  const parts = dmyStr.split("/");
  if (parts.length !== 3) return null;
  const day = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const year = Number(parts[2]);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return new Date(year, month, day);
};

const parseDate = (isoStr: string): Date | null => {
  if (!isoStr) return null;
  const [y, m, d] = isoStr.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d));
};

const Approver: React.FC = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<Category>("prediction10Days");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Filter items based on date range and language status
  const filteredItems = useMemo(() => {
    if (!items.length) return [];

    return items.filter((item) => {
      // Check if the selected language has "inreview" status
      const statusKey = `status_${selectedLanguage}`;
      if (item[statusKey] !== "inreview") return false;

      // Date filtering
      if (fromDate || toDate) {
        const from = parseDate(fromDate);
        const to = parseDate(toDate);
        const itemFrom = parseDMYDate(item.fromdate || "");
        const itemTo = parseDMYDate(item.todate || "");

        if ((fromDate && !itemTo) || (toDate && !itemFrom)) return false;
        if (fromDate && itemTo && itemTo < from) return false;
        if (toDate && itemFrom && itemFrom > to) return false;
      }

      return true;
    });
  }, [items, selectedLanguage, fromDate, toDate]);

  // Fetch items for selected category
  // const fetchItems = async (category: Category) => {
  //   setLoading(true);
  //   setError("");
  //   try {
  //     let url = "";
  //     switch (category) {
  //       case "prediction10Days":
  //         url = `${API_BASE_URL}/predictions/predictions10days`;
  //         break;
  //       default:
  //         url = `${API_BASE_URL}/approver/others`;
  //     }
  //     const res = await fetch(url);
  //     if (!res.ok) throw new Error("Failed to fetch");
  //     const data = await res.json();
  //     setItems(data);
  //   } catch (e) {
  //     setError("Failed to fetch items");
  //     console.error(e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchItems = async (category: Category) => {
    setLoading(true);
    setError("");
    try {
      let url = "";
      switch (category) {
        case "prediction10Days":
          url = `${API_BASE_URL}/approver/prediction10days`;
          break;
        case "predictionDaily":
          url = `${API_BASE_URL}/approver/predictiondaily`;
          break;
        case "activity":
          url = `${API_BASE_URL}/approver/activity`;
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language: selectedLanguage }),
          });

          if (!res.ok) throw new Error("Failed to fetch");
          setItems([]);
          const data = await res.json();
          setItems(data);
          return; // <-- important to stop execution
        // break;
        default:
          url = `${API_BASE_URL}/approver/others`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      setItems([]);
      const data = await res.json();
      setItems(data);
    } catch (e) {
      setError("Failed to fetch items");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchItems(selectedCategory);
  }, [selectedCategory]);

  // Handle approve or reassign action
  // const handleAction = async (id: number, action: "approved" | "assigned") => {
  //   setLoading(true);
  //   setError("");
  //   try {
  //     const statusColumn = `status_${selectedLanguage}`;
  //     const res = await fetch(
  //       `${API_BASE_URL}/approver/prediction10days/status`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           id,
  //           status: action,
  //           statusColumn,
  //           language: selectedLanguage,
  //         }),
  //       }
  //     );
  //     if (!res.ok) throw new Error("Failed to update status");

  //     // Update local state
  //     setItems((prevItems) =>
  //       prevItems.map((item) =>
  //         item.id === id ? { ...item, [statusColumn]: action } : item
  //       )
  //     );

  //     // Clear selected item if it was just processed
  //     if (selectedItem?.id === id) {
  //       setSelectedItem(null);
  //     }
  //   } catch (e) {
  //     setError("Failed to update status");
  //     console.error(e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleAction = async (id: number, action: "approved" | "assigned") => {
    setLoading(true);
    setError("");
    try {
      const statusColumn = `status_${selectedLanguage}`;
      let url = "";
      switch (selectedCategory) {
        case "prediction10Days":
          url = `${API_BASE_URL}/approver/prediction10days/status`;
          break;
        case "predictionDaily":
          url = `${API_BASE_URL}/approver/predictiondaily/status`;
          break;
        case "activity":
          url = `${API_BASE_URL}/approver/activity/status`;
          break;
        default:
          throw new Error("Unsupported category");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: action,
          language: selectedLanguage,
        }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      // Update state
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [statusColumn]: action } : item
        )
      );
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (e) {
      setError("Failed to update status");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  // Get non-empty translations for display
  const getNonEmptyTranslations = (item: ContentItem, langKey: string) => {
    const keys = LANGUAGE_COLUMNS_MAP[langKey] || [];
    return keys.filter((key) => item[key] && item[key].trim() !== "");
  };

  const getSourceLanguage = (item: ContentItem) => {
    // Find the first language that has content (original source)
    for (const lang of LANG_KEYS) {
      const langKey = lang.key;
      const columns = LANGUAGE_COLUMNS_MAP[langKey] || [];
      if (columns.some((col) => item[col] && item[col].trim() !== "")) {
        return langKey;
      }
    }
    return "hi"; // default to Hindi
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Content Approver</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block mb-2 font-medium">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category)}
            className="border border-gray-300 p-2 rounded"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Review Language:</label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          >
            {LANG_KEYS.map((lang) => (
              <option key={lang.key} value={lang.key}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">From Date:</label>
          <input
            type="date"
            className="p-2 border rounded"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">To Date:</label>
          <input
            type="date"
            className="p-2 border rounded"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          onClick={() => {
            setFromDate("");
            setToDate("");
            setSelectedItem(null);
          }}
        >
          Clear Filters
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex gap-6">
        {/* Items List */}
        <div className="w-1/3">
          <h3 className="font-semibold mb-2">
            Items for Review ({filteredItems.length})
          </h3>
          {!loading && filteredItems.length === 0 && (
            <p className="text-gray-600">
              No content pending review for {selectedLanguage.toUpperCase()}.
            </p>
          )}
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {filteredItems.map((item, idx) => (
              <li
                key={item.id}
                className={`p-3 border rounded cursor-pointer ${
                  selectedItem?.id === item.id
                    ? "bg-blue-100 border-blue-300"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="text-sm">
                  <div className="font-semibold flex items-center gap-2">
                    <span>{idx + 1}.</span>
                    {item.fromdate && (
                      <span className="text-gray-500">
                        📅 {formatDate(item.fromdate)}
                      </span>
                    )}
                    {item.lrname && (
                      <span className="text-gray-700 font-medium">
                        {item.lrname}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-600 mt-1">
                    ID: {item.id} | Status: {item[`status_${selectedLanguage}`]}
                  </div>
                  {item.assigned_to && (
                    <div className="text-gray-500 text-xs">
                      Assigned to: {item.assigned_to}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Review Panel */}
        <div className="w-2/3">
          {selectedItem ? (
            <div>
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">Review Content</h3>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleAction(selectedItem.id, "approved")}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(selectedItem.id, "assigned")}
                      disabled={loading}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:bg-gray-400"
                    >
                      Reassign
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>ID:</strong> {selectedItem.id} |{" "}
                  <strong>From:</strong> {formatDate(selectedItem.fromdate)} |{" "}
                  <strong>To:</strong> {formatDate(selectedItem.todate)} |{" "}
                  <strong>Assigned to:</strong> {selectedItem.assigned_to}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 font-semibold text-lg border-b pb-2">
                  <div>
                    Original ({getSourceLanguage(selectedItem).toUpperCase()})
                  </div>
                  <div>Translation ({selectedLanguage.toUpperCase()})</div>
                </div>

                {/* {getNonEmptyTranslations(selectedItem, selectedLanguage).map(
                  (colKey, idx) => {
                    const sourceLanguage = getSourceLanguage(selectedItem);
                    const sourceColumns =
                      LANGUAGE_COLUMNS_MAP[sourceLanguage] || [];
                    const sourceColKey = sourceColumns[idx];

                    return (
                      <div key={colKey} className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded">
                          <div className="text-sm text-gray-500 mb-1">
                            Column {idx + 1}
                          </div>
                          <div>
                            {selectedItem[sourceColKey] || "No source content"}
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded">
                          <div className="text-sm text-gray-500 mb-1">
                            Column {idx + 1} (Review)
                          </div>
                          <div className="whitespace-pre-wrap">
                            {selectedItem[colKey] || "No translation"}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )} */}
                {selectedCategory === "activity" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500 mb-1">
                        Original (EN)
                      </div>
                      <div>
                        {selectedItem[`act_en`] || "No English content"}
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="text-sm text-gray-500 mb-1">
                        Translation ({selectedLanguage.toUpperCase()})
                      </div>
                      <div>
                        {selectedItem[`act_${selectedLanguage}`] ||
                          "No translation for this language"}
                      </div>
                    </div>
                  </div>
                ) : (
                  // fallback for predictions which use xx_1, xx_2 style
                  getNonEmptyTranslations(selectedItem, selectedLanguage).map(
                    (colKey, idx) => {
                      const sourceLanguage = getSourceLanguage(selectedItem);
                      const sourceColumns =
                        LANGUAGE_COLUMNS_MAP[sourceLanguage] || [];
                      const sourceColKey = sourceColumns[idx];

                      return (
                        <div key={colKey} className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 rounded">
                            <div className="text-sm text-gray-500 mb-1">
                              Column {idx + 1}
                            </div>
                            <div>
                              {selectedItem[sourceColKey] ||
                                "No source content"}
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 rounded">
                            <div className="text-sm text-gray-500 mb-1">
                              Column {idx + 1} (Review)
                            </div>
                            <div className="whitespace-pre-wrap">
                              {selectedItem[colKey] || "No translation"}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-20">
              <p>Select an item from the list to review its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Approver;
