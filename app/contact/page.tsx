"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Contact() {
  const { t } = useLanguage();
  
  return (
    <div className="section">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-semibold">{t.contact.title}</h1>
        <p className="mt-3 text-text-secondary">{t.contact.subtitle}</p>
        <form className="mt-8 grid gap-4" method="post" action="/api/lead">
          {[
            { label: t.contact.companyName, name: "companyName" },
            { label: t.contact.contactPerson, name: "contactPerson" },
            { label: t.contact.email, name: "email", type: "email" },
            { label: t.contact.phone, name: "phone" },
            { label: t.contact.industry, name: "industry" },
            { label: t.contact.useCase, name: "useCase" },
            { label: t.contact.dataVolume, name: "dataVolume" }
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm text-text-secondary mb-2">{field.label}</label>
              <input 
                required 
                type={field.type || "text"}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-gold outline-none" 
                name={field.name} 
              />
            </div>
          ))}
          <button className="btn-primary w-full" type="submit">{t.contact.submit}</button>
        </form>
      </div>
    </div>
  );
}
