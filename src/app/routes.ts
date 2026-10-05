import type { ComponentType } from 'react';
import { AboutSection, ContactSection, CoverSection, ProjectsSection, ServicesSection, type SectionProps } from '../components/Books/sections';
 
export const SECTION_COMPONENTS: Record<string, ComponentType<SectionProps>> = {
  cover: CoverSection,
  about: AboutSection,
  projects: ProjectsSection,
  services: ServicesSection,
  contact: ContactSection,
};
