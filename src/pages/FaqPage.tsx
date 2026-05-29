import React from 'react';
import { MarketingPageLayout } from '../components/marketing/MarketingPageLayout';
import { FaqSection } from '../components/marketing/FaqSection';

export function FaqPage() {
  return (
    <MarketingPageLayout titleKey="pages.faq.title" introKey="pages.faq.intro">
      <FaqSection />
    </MarketingPageLayout>
  );
}
