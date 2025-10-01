import React from "react";
import { CorrectionItem } from "./types";
import { getLanguageSpecificStatus } from "./utils";

const CorrectionVideo: React.FC<{ item: CorrectionItem; lang: string }> = ({
  item,
  lang,
}) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Video</h3>
    <div className="aspect-w-16 aspect-h-9">
      <iframe
        src={item.url}
        className="w-full h-64 rounded-lg"
        title="Related Video"
        frameBorder="0"
        allowFullScreen
      />
    </div>
    <div className="mt-2 text-sm text-gray-600">
      ID: {item.id} | Status: {getLanguageSpecificStatus(item, lang)} | Date:{" "}
      {item.Date}
    </div>
  </div>
);

export default CorrectionVideo;
