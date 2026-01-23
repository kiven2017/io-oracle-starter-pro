# AI Oracle Labs - i18n Implementation Guide

## 📁 Project Structure

The i18n system is implemented using a dictionary-based approach for easy language extension:

```
lib/i18n/
├── dictionaries/
│   ├── zh-CN.ts    # Chinese translations
│   └── en.ts       # English translations
├── LanguageProvider.tsx  # Client-side context provider
└── index.ts        # Main i18n configuration
```

## 🌐 Current Implementation

### Features
- ✅ Client-side language switching
- ✅ Persistent language preference (localStorage)
- ✅ Type-safe translations (TypeScript)
- ✅ Dynamic language switching without page reload
- ✅ Supports Chinese (zh-CN) and English (en)

### How It Works

1. **Language Provider**: Wraps the entire app and provides language context
2. **Dictionary**: All translations are stored in typed dictionaries
3. **Hook**: Use `useLanguage()` hook to access translations and switch language
4. **Type Safety**: All translation keys are type-checked

## 🔧 Adding a New Language

Follow these steps to add a new language (e.g., Japanese):

### Step 1: Create Dictionary File

Create `lib/i18n/dictionaries/ja.ts`:

```typescript
import type { Dictionary } from "./zh-CN";

export const ja: Dictionary = {
  nav: {
    home: "ホーム",
    solutions: "ソリューション",
    // ... copy all keys from zh-CN.ts and translate
  },
  hero: {
    title: "実世界のデータを信頼できる形でブロックチェーンに",
    // ... translate all other keys
  },
  // ... translate all sections
};
```

### Step 2: Register Language

Update `lib/i18n/index.ts`:

```typescript
import { zhCN } from "./dictionaries/zh-CN";
import { en } from "./dictionaries/en";
import { ja } from "./dictionaries/ja";  // Add this

export type Locale = "zh-CN" | "en" | "ja";  // Add "ja"

const dictionaries = {
  "zh-CN": zhCN,
  en: en,
  ja: ja,  // Add this
};

export const locales: Locale[] = ["zh-CN", "en", "ja"];  // Add "ja"
```

### Step 3: Update Language Switcher

Update `components/Header.tsx` to add the new language button:

```typescript
<button
  onClick={() => setLocale("ja")}
  className={`${locale === "ja" ? "text-gold font-semibold" : "text-white/60 hover:text-gold"} transition`}
>
  日本語
</button>
```

### Step 4: Update HTML Lang Attribute

Update `lib/i18n/LanguageProvider.tsx` if needed:

```typescript
const setLocale = (newLocale: Locale) => {
  // ...
  document.documentElement.lang = newLocale === "zh-CN" ? "zh-CN" 
    : newLocale === "en" ? "en" 
    : "ja";  // Add this
};
```

## 💡 Usage in Components

### For Client Components

```typescript
"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function MyComponent() {
  const { t, locale, setLocale } = useLanguage();
  
  return (
    <div>
      <h1>{t.hero.title}</h1>
      <p>{t.hero.subtitle}</p>
    </div>
  );
}
```

### For Server Components

Server components receive props directly, so you'll need to convert them to client components or pass translations as props.

## 🎨 Best Practices

1. **Keep Keys Consistent**: All language files must have the same structure
2. **Type Safety**: TypeScript will enforce all keys exist in new languages
3. **Nested Structure**: Organize translations by section for better maintainability
4. **Default Fallback**: The system defaults to zh-CN if no language is set
5. **Context-Aware**: Translations should consider cultural context, not just literal translation

## 🚀 Current Language Support

- 🇨🇳 Chinese (zh-CN) - Default
- 🇺🇸 English (en)

## 📝 Translation Structure

The dictionary is organized into these main sections:

- `nav`: Navigation menu items
- `hero`: Homepage hero section
- `about`: About section
- `coreValues`: Core values section
- `industries`: Industry solutions
- `partners`: Partners section
- `team`: Team section
- `news`: News/updates section
- `monitor`: Real-time monitor section
- `footer`: Footer content

## 🔍 Tips for Translators

1. **Maintain Tone**: Keep the professional yet approachable tone
2. **Technical Terms**: Some terms like "IoT", "AI", "RWA" should remain in English
3. **Length Awareness**: Some translations may be longer/shorter; check UI layout
4. **Cultural Adaptation**: Adapt examples and references for local audience
5. **Consistency**: Use consistent terminology throughout

## 🛠️ Troubleshooting

### Language Not Switching
- Check localStorage in browser DevTools
- Verify LanguageProvider wraps your components
- Check console for errors

### Missing Translations
- TypeScript will show errors for missing keys
- All keys from zh-CN.ts must exist in other language files

### Type Errors
- Ensure new dictionary imports Dictionary type from zh-CN.ts
- All language files must match the Dictionary type structure
