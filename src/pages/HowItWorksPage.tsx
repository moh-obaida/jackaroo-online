import React from 'react';
import { MarketingPageLayout } from '../components/marketing/MarketingPageLayout';
import { HowItWorksSection } from '../components/marketing/HowItWorksSection';

export function HowItWorksPage() {
  return (
    <MarketingPageLayout
      eyebrowKey="pages.how.eyebrow"
      titleKey="pages.how.title"
      subtitleKey="pages.how.subtitle"
      introKey="pages.how.intro"
    >
      <HowItWorksSection />
    </MarketingPageLayout>
  );
}
