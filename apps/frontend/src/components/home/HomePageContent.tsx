'use client';

import { HeroSection } from './HeroSection';
import { CategoryGrid } from './CategoryGrid';
import { AdvantagesSection } from './AdvantagesSection';
import { ServiceSection } from './ServiceSection';
import { WarrantyDeliverySection } from './WarrantyDeliverySection';
import { LeasingSection } from './LeasingSection';
import { ContactsSection } from './ContactsSection';

export function HomePageContent() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <AdvantagesSection />
      <ServiceSection />
      <WarrantyDeliverySection />
      <LeasingSection />
      {/* <InfoArticlesSection /> */}
      <ContactsSection />
    </>
  );
}
