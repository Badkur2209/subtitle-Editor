import React from "react";
import { CorrectionItem } from "./types";
import {
  getActivityText,
  getLanguageText,
  getLanguageSpecificStatus,
} from "./utils";

interface CorrectionEditorProps {
  selectedItem: CorrectionItem | null;
  lang: string;
  correctedText: string;
  setCorrectedText: React.Dispatch<React.SetStateAction<string>>;
  saving: boolean;
  onSave: () => void;
}

const CorrectionEditor: React.FC<CorrectionEditorProps> = ({
  selectedItem,
  lang,
  correctedText,
  setCorrectedText,
  saving,
  onSave,
}) => {
  if (!selectedItem) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        Select an item from the list to start correcting
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Original ({lang.toUpperCase()})
        </h3>
      </div>

      {/* Activity Text */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600 mb-1">
          Activity Text (act_{lang}):
        </p>
        <p className="text-gray-800">
          {getActivityText(selectedItem, lang) || "No activity text"}
        </p>
      </div>

      {/* Language Text */}
      <div className="mb-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-600 mb-1">Language Text ({lang}):</p>
        <p className="text-gray-800">
          {getLanguageText(selectedItem, lang) || "No language text"}
        </p>
      </div>

      {/* Correction Textarea */}
      <textarea
        value={correctedText}
        onChange={(e) => setCorrectedText(e.target.value)}
        className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Make corrections to the original text..."
      />

      <div className="mt-4 flex justify-end">
        <button
          onClick={onSave}
          disabled={saving || !correctedText.trim()}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Correction"}
        </button>
      </div>
    </div>
  );
};

export default CorrectionEditor;
