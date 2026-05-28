import React from 'react';
import { PageFrame } from './PageFrame';
import { Panel } from './Panel';
import { BackHomeButton } from '../common/BackHomeButton';

type FormPageProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/** Standard create/join/auth/profile form layout. */
export function FormPage({ title, subtitle, children, footer }: FormPageProps) {
  return (
    <PageFrame variant="form">
      <div className="mb-5">
        <BackHomeButton intent="navigate" />
      </div>
      <Panel title={title} subtitle={subtitle} glow>
        {children}
      </Panel>
      {footer}
    </PageFrame>
  );
}
