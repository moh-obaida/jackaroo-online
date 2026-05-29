import React from 'react';
import { MarketingPageLayout } from '../components/marketing/MarketingPageLayout';
import { FaqSection } from '../components/marketing/FaqSection';

export function FaqPage() {
  return (
    <MarketingPageLayout
      eyebrowKey="pages.faq.eyebrow"
      titleKey="pages.faq.title"
      introKey="pages.faq.intro"
      ctaTitleKey="pages.faq.ctaTitle"
      ctaLeadKey="pages.faq.ctaLead"
    >
      <FaqSection />
    </MarketingPageLayout>
  );
}
