import React from 'react';
import { MarketingPageLayout } from '../components/marketing/MarketingPageLayout';
import { RulesSection } from '../components/marketing/RulesSection';

export function RulesPage() {
  return (
    <MarketingPageLayout
      titleKey="pages.rules.title"
      subtitleKey="pages.rules.subtitle"
      introKey="pages.rules.intro"
    >
      <RulesSection />
    </MarketingPageLayout>
  );
}
