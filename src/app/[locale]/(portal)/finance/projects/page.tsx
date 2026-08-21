import type { Metadata } from 'next';

import { ProjectsFeature } from '@/features/finance';

export const metadata: Metadata = {
  title: 'Projects',
};

export default function ProjectsPage() {
  return <ProjectsFeature />;
}
