import React, { useState, useEffect } from "react";
import axios from "axios";

interface CorrectionItem {
  id: number;
  Date: string;
  status: "pending" | "assigned" | "approved";
  act_hi?: string;
  act_en?: string;
  act_gu?: string;
  act_mr?: string;
  act_te?: string;
  act_bn?: string;
  hi?: string;
  en?: string;
  gu?: string;
  mr?: string;
  te?: string;
  bn?: string;
  url?: string;
  assigned_to?: string;
  status_hi?: string;
  status_en?: string;
  status_gu?: string;
  status_mr?: string;
  status_te?: string;
  status_bn?: string;
}

interface CorrectionFormData {
  module: string;
  sourceLanguage: string;
  date: string;
}

const Correction: React.FC = () => {
  const [formData, setFormData] = useState<CorrectionFormData>({
    module: "",
    sourceLanguage: "",
    date: "",
  });

  const [items, setItems] = useState<CorrectionItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CorrectionItem | null>(null);
  const [correctedText, setCorrectedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const moduleOptions = [
    { value: "", label: "Select Module" },
    { value: "activities", label: "Activities" },
    { value: "predictionDaily", label: "Prediction Daily" },
    { value: "prediction10Days", label: "Prediction 10 Days" },
  ];

  const languageOptions = [
    { value: "", label: "Select Language" },
    { value: "hi", label: "Hindi" },
    { value: "en", label: "English" },
    { value: "gu", label: "Gujarati" },
    { value: "mr", label: "Marathi" },
    { value: "te", label: "Telugu" },
    { value: "bn", label: "Bengali" },
  ];

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-500";
      case "assigned":
        return "bg-yellow-500";
      case "inreview":
        return "bg-orange-500";
      case "pending":
      default:
        return "bg-red-500";
    }
  };

  const getLanguageSpecificStatus = (
    item: CorrectionItem,
    language: string
  ): string => {
    switch (language) {
      case "hi":
        return item.status_hi || item.status || "pending";
      case "en":
        return item.status_en || item.status || "pending";
      case "gu":
        return item.status_gu || item.status || "pending";
      case "mr":
        return item.status_mr || item.status || "pending";
      case "te":
        return item.status_te || item.status || "pending";
      case "bn":
        return item.status_bn || item.status || "pending";
      default:
        return item.status || "pending";
    }
  };

  const getActivityText = (item: CorrectionItem, language: string): string => {
    switch (language) {
      case "hi":
        return item.act_hi || "";
      case "en":
        return item.act_en || "";
      case "gu":
        return item.act_gu || "";
      case "mr":
        return item.act_mr || "";
      case "te":
        return item.act_te || "";
      case "bn":
        return item.act_bn || "";
      default:
        return item.act_hi || "";
    }
  };

  const getLanguageText = (item: CorrectionItem, language: string): string => {
    switch (language) {
      case "hi":
        return item.hi || "";
      case "en":
        return item.en || "";
      case "gu":
        return item.gu || "";
      case "mr":
        return item.mr || "";
      case "te":
        return item.te || "";
      case "bn":
        return item.bn || "";
      default:
        return item.hi || "";
    }
  };

  const getCombinedText = (item: CorrectionItem, language: string): string => {
    const actText = getActivityText(item, language);
    const langText = getLanguageText(item, language);

    // Prioritize act_<language> over <language> text
    return actText || langText || "";
  };

  const handleInputChange = (
    field: keyof CorrectionFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLoadItems = async () => {
    if (!formData.module || !formData.sourceLanguage) {
      alert("Please select both module and source language");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/correction/load-items",
        {
          module: formData.module,
          sourceLanguage: formData.sourceLanguage,
          date: formData.date,
        }
      );

      setItems(response.data.items);
    } catch (error) {
      console.error("Error loading items:", error);
      alert("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (item: CorrectionItem) => {
    setSelectedItem(item);
    // Set the original text based on the source language
    const originalText = getCombinedText(item, formData.sourceLanguage);
    setCorrectedText(originalText);
  };

  const handleSaveCorrection = async () => {
    if (!selectedItem || !correctedText.trim()) {
      alert("Please select an item and provide corrected text");
      return;
    }

    setSaving(true);
    try {
      await axios.post(
        "http://localhost:5000/api/api/correction/save-correction",
        {
          id: selectedItem.id,
          module: formData.module,
          sourceLanguage: formData.sourceLanguage,
          correctedText: correctedText.trim(),
        }
      );

      alert("Correction saved successfully!");

      // Update the item in the list with new status
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === selectedItem.id) {
            const updatedItem = { ...item };
            // Update the language-specific status
            const statusField =
              `status_${formData.sourceLanguage}` as keyof CorrectionItem;
            (updatedItem as any)[statusField] = "approved";
            return updatedItem;
          }
          return item;
        })
      );
    } catch (error) {
      console.error("Error saving correction:", error);
      alert("Failed to save correction");
    } finally {
      setSaving(false);
    }
  };

  const clearSelection = () => {
    setSelectedItem(null);
    setCorrectedText("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Activity Translation Correction Editor
        </h1>

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module
              </label>
              <select
                value={formData.module}
                onChange={(e) => handleInputChange("module", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {moduleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Language
              </label>
              <select
                value={formData.sourceLanguage}
                onChange={(e) =>
                  handleInputChange("sourceLanguage", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <button
                onClick={handleLoadItems}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Loading..." : "Load"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Items List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Activities ({items.length})
              </h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.map((item, index) => {
                const languageStatus = getLanguageSpecificStatus(
                  item,
                  formData.sourceLanguage
                );
                const combinedText = getCombinedText(
                  item,
                  formData.sourceLanguage
                );

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedItem?.id === item.id
                        ? "bg-blue-50 border-blue-200"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`w-3 h-3 rounded-full ${getStatusColor(
                            languageStatus
                          )}`}
                        ></span>
                        <span className="font-medium">
                          {index + 1}. {combinedText.substring(0, 50)}
                          {combinedText.length > 50 ? "..." : ""}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{item.Date}</div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Status: {languageStatus} | ID: {item.id}
                      {item.assigned_to && ` | Assigned: ${item.assigned_to}`}
                    </div>
                  </div>
                );
              })}
              {items.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No items found. Please select filters and click Load.
                </div>
              )}
            </div>
          </div>

          {/* Video and Correction Panel */}
          <div className="space-y-6">
            {/* Video Iframe */}
            {selectedItem?.url && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Related Video
                </h3>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={selectedItem.url}
                    className="w-full h-64 rounded-lg"
                    title="Related Video"
                    frameBorder="0"
                    allowFullScreen
                  />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  ID: {selectedItem.id} | Status:{" "}
                  {getLanguageSpecificStatus(
                    selectedItem,
                    formData.sourceLanguage
                  )}{" "}
                  | Date: {selectedItem.Date}
                </div>
              </div>
            )}

            {/* Correction Text Area */}
            {selectedItem && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Original ({formData.sourceLanguage.toUpperCase()})
                  </h3>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear Selection
                  </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600 mb-1">
                    Activity Text (act_{formData.sourceLanguage}):
                  </p>
                  <p className="text-gray-800">
                    {getActivityText(selectedItem, formData.sourceLanguage) ||
                      "No activity text"}
                  </p>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600 mb-1">
                    Language Text ({formData.sourceLanguage}):
                  </p>
                  <p className="text-gray-800">
                    {getLanguageText(selectedItem, formData.sourceLanguage) ||
                      "No language text"}
                  </p>
                </div>

                <textarea
                  value={correctedText}
                  onChange={(e) => setCorrectedText(e.target.value)}
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Make corrections to the original text..."
                />
                <textarea
                  value={correctedText}
                  onChange={(e) => setCorrectedText(e.target.value)}
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Make corrections to the original text..."
                />

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSaveCorrection}
                    disabled={saving || !correctedText.trim()}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Correction"}
                  </button>
                </div>
              </div>
            )}

            {!selectedItem && (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                Select an item from the list to start correcting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Correction;
