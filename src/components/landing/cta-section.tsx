import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-secondary">
      <div className="mx-auto max-w-4xl text-center">
        {/* Gradient background effect */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-brand/20 via-accent-purple/20 to-status-success/20 blur-3xl opacity-50" />

          <div className="relative p-8 sm:p-12 rounded-2xl border border-border-default bg-bg-card">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Ready to Ensure Compliance?
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Start analyzing your local ordinances and draft bills today.
              No credit card required for the demo.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/chat" className="flex items-center gap-2">
                  Start Free Analysis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/graph">
                  View Demo Graph
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 pt-8 border-t border-border-default">
              <p className="text-sm text-text-muted mb-4">Trusted by legal professionals</p>
              <div className="flex flex-wrap justify-center gap-8 text-text-muted">
                <span className="text-sm">Federal Compliance</span>
                <span className="text-sm">State Law Analysis</span>
                <span className="text-sm">Municipal Review</span>
                <span className="text-sm">Citation Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
