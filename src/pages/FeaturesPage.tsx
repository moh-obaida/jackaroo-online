import React from 'react';
import { MarketingPageLayout } from '../components/marketing/MarketingPageLayout';
import { FeaturesSection } from '../components/marketing/FeaturesSection';

export function FeaturesPage() {
  return (
    <MarketingPageLayout
      eyebrowKey="pages.features.eyebrow"
      titleKey="pages.features.title"
      subtitleKey="pages.features.subtitle"
      introKey="pages.features.intro"
    >
      <FeaturesSection />
    </MarketingPageLayout>
  );
}
