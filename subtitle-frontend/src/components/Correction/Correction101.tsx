import React, { useState } from "react";
import axios from "axios";
import CorrectionForm from "./CorrectionForm";
import CorrectionList from "./CorrectionList";
import CorrectionEditor from "./CorrectionEditor";
import CorrectionVideo from "./CorrectionVideo";
import { CorrectionItem, CorrectionFormData } from "./types";
import { getLanguageSpecificStatus, getCombinedText } from "./utils";

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

  const handleInputChange = (
    field: keyof CorrectionFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLoadItems = async () => {
    if (!formData.module || !formData.sourceLanguage) {
      alert("Please select both module and source language");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/correction/load-items",
        formData
      );
      setItems(data.items);
    } catch {
      alert("Failed to load items");
    }
    setLoading(false);
  };

  const handleItemSelect = (item: CorrectionItem) => {
    setSelectedItem(item);
    setCorrectedText(getCombinedText(item, formData.sourceLanguage));
  };

  const handleSaveCorrection = async () => {
    if (!selectedItem || !correctedText.trim()) return;
    setSaving(true);
    try {
      await axios.post("http://localhost:5000/api/correction/save-correction", {
        id: selectedItem.id,
        ...formData,
        correctedText: correctedText.trim(),
      });
      // update UI
      setItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? { ...item, [`status_${formData.sourceLanguage}`]: "approved" }
            : item
        )
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Activity Translation Correction Editor
        </h1>

        <CorrectionForm
          formData={formData}
          moduleOptions={[
            { value: "", label: "Select Module" },
            { value: "activities", label: "Activities" },
            { value: "predictionDaily", label: "Prediction Daily" },
            { value: "prediction10Days", label: "Prediction 10 Days" },
          ]}
          languageOptions={[
            { value: "", label: "Select Language" },
            { value: "en", label: "English" },
            { value: "hi", label: "Hindi" },
            { value: "mr", label: "Marathi" },
            { value: "bn", label: "Bengali" },
            { value: "te", label: "Telugu" },
            { value: "gu", label: "Gujarati" },
          ]}
          loading={loading}
          onInputChange={handleInputChange}
          onLoad={handleLoadItems}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CorrectionList
            items={items}
            selected={selectedItem}
            sourceLanguage={formData.sourceLanguage}
            onSelect={handleItemSelect}
          />
          <div className="space-y-6">
            {selectedItem?.url && (
              <CorrectionVideo
                item={selectedItem}
                lang={formData.sourceLanguage}
              />
            )}
            <CorrectionEditor
              selectedItem={selectedItem}
              lang={formData.sourceLanguage}
              correctedText={correctedText}
              setCorrectedText={setCorrectedText}
              saving={saving}
              onSave={handleSaveCorrection}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Correction;
