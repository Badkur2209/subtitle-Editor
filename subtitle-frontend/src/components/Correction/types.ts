export interface CorrectionItem {
  id: number;
  Date: string;
  status: "pending" | "assigned" | "approved";
  // translations
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

export interface CorrectionFormData {
  module: string;
  sourceLanguage: string;
  date: string;
}
export interface ModuleConfig {
  value: string;
  label: string;
  api: {
    loadUrl: string;
    saveUrl: string;
  };
  mode: "single" | "multi";
}
