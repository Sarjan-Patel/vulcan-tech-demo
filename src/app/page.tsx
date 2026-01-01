import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { DemoPreview } from '@/components/landing/demo-preview';
import { CTASection } from '@/components/landing/cta-section';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <DemoPreview />
      <CTASection />
      <Footer />
    </main>
  );
}
