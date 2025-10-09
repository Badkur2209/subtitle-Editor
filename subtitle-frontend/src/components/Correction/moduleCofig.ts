import { ModuleConfig } from "./types";

export const modules: ModuleConfig[] = [
  {
    value: "activities",
    label: "Activities",
    api: {
      loadUrl: "http://localhost:5000/api/correction/load-items",
      saveUrl: "http://localhost:5000/api/correction/save-correction",
    },
    mode: "single", // one field per language
  },
  {
    value: "predictionDaily",
    label: "Prediction Daily",
    api: {
      loadUrl: "http://localhost:5000/api/prediction/daily/load",
      saveUrl: "http://localhost:5000/api/prediction/daily/save",
    },
    mode: "multi", // multiple numbered fields
  },
];
