import React from "react";
import { CorrectionItem } from "./types";
import {
  getStatusColor,
  getLanguageSpecificStatus,
  getCombinedText,
} from "./utils";
import { getPredictionDailyTexts } from "./utils";
interface CorrectionListProps {
  items: CorrectionItem[];
  selected: CorrectionItem | null;
  sourceLanguage: string;
  onSelect: (item: CorrectionItem) => void;
}
const CorrectionList: React.FC<CorrectionListProps> = ({
  items,
  selected,
  sourceLanguage,
  onSelect,
}) => {
  return (
    <div>
      {items.map((item, index) => {
        // Detect if it's multi-field (like PredictionDaily)
        const isMulti = Object.keys(item).some((k) =>
          k.startsWith(`${sourceLanguage}_`)
        );

        let previewText = "";
        if (isMulti) {
          const parts = getPredictionDailyTexts(item, sourceLanguage);
          previewText = parts.join(" | ");
        } else {
          previewText = getCombinedText(item, sourceLanguage);
        }

        return (
          <div key={item.id} onClick={() => onSelect(item)}>
            <strong>{index + 1}.</strong> {previewText.substring(0, 50)}
          </div>
        );
      })}
    </div>
  );
};
// const CorrectionList: React.FC<CorrectionListProps> = ({
//   items,
//   selected,
//   sourceLanguage,
//   onSelect,
// }) => (
//   <div className="bg-white rounded-lg shadow-md">
//     <div className="p-6 border-b border-gray-200">
//       <h2 className="text-xl font-semibold text-gray-900">
//         Activities ({items.length})
//       </h2>
//     </div>
//     <div className="max-h-96 overflow-y-auto">
//       {items.map((item, index) => {
//         const languageStatus = getLanguageSpecificStatus(item, sourceLanguage);
//         const combinedText = getCombinedText(item, sourceLanguage);

//         return (
//           <div
//             key={item.id}
//             onClick={() => onSelect(item)}
//             className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
//               selected?.id === item.id ? "bg-blue-50 border-blue-200" : ""
//             }`}
//           >
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <span
//                   className={`w-3 h-3 rounded-full ${getStatusColor(
//                     languageStatus
//                   )}`}
//                 ></span>
//                 <span className="font-medium">
//                   {index + 1}. {combinedText.substring(0, 50)}
//                   {combinedText.length > 50 ? "..." : ""}
//                 </span>
//               </div>
//               <div className="text-sm text-gray-500">{item.Date}</div>
//             </div>

//             <div className="mt-2 text-sm text-gray-600">
//               Status: {languageStatus} | ID: {item.id}
//               {item.assigned_to && ` | Assigned: ${item.assigned_to}`}
//             </div>
//           </div>
//         );
//       })}

//       {items.length === 0 && (
//         <div className="p-8 text-center text-gray-500">
//           No items found. Please select filters and click Load.
//         </div>
//       )}
//     </div>
//   </div>
// );

export default CorrectionList;
