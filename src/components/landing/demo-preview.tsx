'use client';

import { useState } from 'react';
import { MessageSquare, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function DemoPreview() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Input',
      description: 'Paste your ordinance or draft bill',
    },
    {
      label: 'Analyze',
      description: 'AI scans against legal hierarchy',
    },
    {
      label: 'Results',
      description: 'View conflicts and suggestions',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            See How It Works
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Three simple steps to identify legal conflicts and get compliant suggestions.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center items-center gap-4 mb-12">
          {steps.map((step, index) => (
            <button
              key={step.label}
              onClick={() => setActiveStep(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                activeStep === index
                  ? 'bg-brand text-primary-foreground'
                  : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="text-sm font-medium">{index + 1}. {step.label}</span>
            </button>
          ))}
        </div>

        {/* Demo window */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-border-default bg-bg-card overflow-hidden shadow-2xl shadow-brand/5">
            {/* Window header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-bg-elevated border-b border-border-default">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-status-error/50" />
                <div className="w-3 h-3 rounded-full bg-status-warning/50" />
                <div className="w-3 h-3 rounded-full bg-status-success/50" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-sm text-text-muted">vulcan.legal/chat</span>
              </div>
            </div>

            {/* Demo content */}
            <div className="p-6 min-h-[400px]">
              {activeStep === 0 && (
                <div className="animate-fade-in">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center shrink-0">
                      <MessageSquare className="h-5 w-5 text-brand" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-text-muted mb-2">Your query</p>
                      <div className="p-4 rounded-lg bg-bg-elevated border border-border-default">
                        <p className="text-text-primary">
                          &quot;Does the Austin short-term rental ordinance requiring owner occupancy conflict with Texas state property law?&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => setActiveStep(1)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-primary-foreground hover:bg-brand/90 transition-colors"
                    >
                      Analyze
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="animate-fade-in flex flex-col items-center justify-center h-[300px]">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-brand/20 border-t-brand animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-brand/20" />
                    </div>
                  </div>
                  <p className="mt-6 text-text-secondary">Analyzing against legal hierarchy...</p>
                  <div className="mt-4 flex gap-2">
                    <Badge variant="outline" className="text-federal border-federal/30 bg-federal/10">Federal</Badge>
                    <Badge variant="outline" className="text-state border-state/30 bg-state/10">State</Badge>
                    <Badge variant="outline" className="text-municipal border-municipal/30 bg-municipal/10">Municipal</Badge>
                  </div>
                  <button
                    onClick={() => setActiveStep(2)}
                    className="mt-8 text-sm text-brand hover:text-brand/80 transition-colors"
                  >
                    Skip to results
                  </button>
                </div>
              )}

              {activeStep === 2 && (
                <div className="animate-fade-in space-y-4">
                  {/* Conflict found */}
                  <div className="p-4 rounded-lg border border-status-warning/30 bg-status-warning/5">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-status-warning shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-text-primary mb-1">Potential Conflict Detected</h4>
                        <p className="text-sm text-text-secondary mb-2">
                          Austin&apos;s owner-occupancy requirement may exceed municipal authority under Texas property law.
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-text-muted">Tex. Prop. Code § 5.001</Badge>
                          <Badge variant="outline" className="text-text-muted">Austin Code § 25-2-788</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Suggestion */}
                  <div className="p-4 rounded-lg border border-status-success/30 bg-status-success/5">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-status-success shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-text-primary mb-1">Suggested Revision</h4>
                        <p className="text-sm text-text-secondary">
                          Replace mandatory requirement with optional incentive program for owner-occupied rentals.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <button
                      onClick={() => setActiveStep(0)}
                      className="text-sm text-brand hover:text-brand/80 transition-colors"
                    >
                      Try another example
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
