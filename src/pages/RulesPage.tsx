import React from 'react';
import { MarketingPageLayout } from '../components/marketing/MarketingPageLayout';
import { RulesSection } from '../components/marketing/RulesSection';

export function RulesPage() {
  return (
    <MarketingPageLayout
      eyebrowKey="pages.rules.eyebrow"
      titleKey="pages.rules.title"
      subtitleKey="pages.rules.subtitle"
      introKey="pages.rules.intro"
      showPlayCta={false}
    >
      <RulesSection />
    </MarketingPageLayout>
  );
}
