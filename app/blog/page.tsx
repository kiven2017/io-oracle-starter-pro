"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Blog() {
  const { t } = useLanguage();
  
  return (
    <div className='section container'>
      <h1 className='text-3xl font-semibold'>{t.blog.title}</h1>
      <p className='mt-3 text-text-secondary'>{t.blog.subtitle}</p>
    </div>
  );
}
