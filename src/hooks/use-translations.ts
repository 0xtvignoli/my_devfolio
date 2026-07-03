import { useContext } from "react";
import { TranslationContext } from "@/contexts/translation-context";

export function useTranslations() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslations must be used within a TranslationProvider');
  }
  return context;
}
