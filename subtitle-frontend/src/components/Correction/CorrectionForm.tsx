import React from "react";
import { CorrectionFormData } from "./types";

interface CorrectionFormProps {
  formData: CorrectionFormData;
  moduleOptions: { value: string; label: string }[];
  languageOptions: { value: string; label: string }[];
  loading: boolean;
  onInputChange: (field: keyof CorrectionFormData, value: string) => void;
  onLoad: () => void;
}

const CorrectionForm: React.FC<CorrectionFormProps> = ({
  formData,
  moduleOptions,
  languageOptions,
  loading,
  onInputChange,
  onLoad,
}) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Module
        </label>
        <select
          value={formData.module}
          onChange={(e) => onInputChange("module", e.target.value)}
          className="w-full border px-3 py-2 rounded-md"
        >
          {moduleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
          onChange={(e) => onInputChange("sourceLanguage", e.target.value)}
          className="w-full border px-3 py-2 rounded-md"
        >
          {languageOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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
          onChange={(e) => onInputChange("date", e.target.value)}
          className="w-full border px-3 py-2 rounded-md"
        />
      </div>

      <div>
        <button
          onClick={onLoad}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          {loading ? "Loading..." : "Load"}
        </button>
      </div>
    </div>
  </div>
);

export default CorrectionForm;
