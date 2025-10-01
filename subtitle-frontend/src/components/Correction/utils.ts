import { CorrectionItem } from "./types";

export const getStatusColor = (status?: string) => {
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

export const getLanguageSpecificStatus = (
  item: CorrectionItem,
  lang: string
) => {
  const statuses: Record<string, string | undefined> = {
    hi: item.status_hi,
    en: item.status_en,
    gu: item.status_gu,
    mr: item.status_mr,
    te: item.status_te,
    bn: item.status_bn,
  };
  return statuses[lang] || item.status || "pending";
};

export const getActivityText = (item: CorrectionItem, lang: string) => {
  const activityTexts: Record<string, string | undefined> = {
    hi: item.act_hi,
    en: item.act_en,
    gu: item.act_gu,
    mr: item.act_mr,
    te: item.act_te,
    bn: item.act_bn,
  };
  return activityTexts[lang] || "";
};

export const getLanguageText = (item: CorrectionItem, lang: string) => {
  const texts: Record<string, string | undefined> = {
    hi: item.hi,
    en: item.en,
    gu: item.gu,
    mr: item.mr,
    te: item.te,
    bn: item.bn,
  };
  return texts[lang] || "";
};
export const getPredictionDailyTexts = (
  item: any,
  lang: string,
  maxSegments: number = 4 // fallback, could be configurable
): string[] => {
  const texts: string[] = [];
  for (let i = 1; i <= maxSegments; i++) {
    const key = `${lang}_${i}`;
    if (item[key]) texts.push(item[key]);
  }
  return texts;
};
export const getCombinedText = (item: CorrectionItem, lang: string) =>
  getActivityText(item, lang) || getLanguageText(item, lang) || "";
