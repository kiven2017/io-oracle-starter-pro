import { zhCN } from "./dictionaries/zh-CN";
import { en } from "./dictionaries/en";

export type Locale = "zh-CN" | "en";

const dictionaries = {
  "zh-CN": zhCN,
  en: en,
};

export const getDictionary = (locale: Locale) => dictionaries[locale];

export const locales: Locale[] = ["zh-CN", "en"];
export const defaultLocale: Locale = "en";
