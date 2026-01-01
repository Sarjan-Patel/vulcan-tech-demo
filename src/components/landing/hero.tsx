import Link from 'next/link';
import { ArrowRight, Shield, FileSearch, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand/5 via-transparent to-transparent" />

      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border-default bg-bg-elevated/50 backdrop-blur-sm mb-8">
          <Shield className="h-4 w-4 text-brand" />
          <span className="text-sm text-text-secondary">AI-Powered Legal Analysis</span>
        </div>

        {/* Main headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary mb-6">
          Detect Legal Conflicts{' '}
          <span className="text-brand">Before They Matter</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto mb-10">
          Instantly analyze local ordinances and draft bills against federal and state law.
          Get citation-backed reasoning and compliant language suggestions.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href="/chat" className="flex items-center gap-2">
              Start Analyzing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/graph">
              Explore Legal Hierarchy
            </Link>
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex flex-col items-center p-6 rounded-xl border border-border-default bg-bg-card/50 backdrop-blur-sm">
            <FileSearch className="h-8 w-8 text-brand mb-4" />
            <h3 className="font-semibold text-text-primary mb-2">Conflict Detection</h3>
            <p className="text-sm text-text-muted text-center">
              Automatically identify conflicts between local rules and higher authorities
            </p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-xl border border-border-default bg-bg-card/50 backdrop-blur-sm">
            <Scale className="h-8 w-8 text-status-success mb-4" />
            <h3 className="font-semibold text-text-primary mb-2">Citation Backed</h3>
            <p className="text-sm text-text-muted text-center">
              Every analysis includes proper legal citations for verification
            </p>
          </div>
          <div className="flex flex-col items-center p-6 rounded-xl border border-border-default bg-bg-card/50 backdrop-blur-sm">
            <Shield className="h-8 w-8 text-accent-purple mb-4" />
            <h3 className="font-semibold text-text-primary mb-2">Compliant Suggestions</h3>
            <p className="text-sm text-text-muted text-center">
              Get AI-generated language that aligns with existing law
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
