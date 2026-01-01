import {
  Layers,
  GitBranch,
  FileText,
  Lightbulb,
  CheckCircle,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Multi-Level Analysis',
    description: 'Analyze regulations across federal, state, and municipal jurisdictions simultaneously.',
    color: 'text-federal',
  },
  {
    icon: GitBranch,
    title: 'Authority Hierarchy',
    description: 'Visualize the chain of authority from constitutional provisions to local ordinances.',
    color: 'text-state',
  },
  {
    icon: FileText,
    title: 'Detailed Citations',
    description: 'Every finding includes proper Bluebook citations with links to primary sources.',
    color: 'text-brand',
  },
  {
    icon: Lightbulb,
    title: 'Smart Suggestions',
    description: 'Receive AI-generated alternative language that resolves identified conflicts.',
    color: 'text-accent-purple',
  },
  {
    icon: CheckCircle,
    title: 'Compliance Tracking',
    description: 'Track the compliance status of your ordinances and get notified of changes.',
    color: 'text-status-success',
  },
  {
    icon: Zap,
    title: 'Instant Analysis',
    description: 'Get results in seconds, not hours. Powered by advanced AI legal reasoning.',
    color: 'text-municipal',
  },
];

export function Features() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-bg-secondary">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Everything You Need for Legal Compliance
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Comprehensive tools for analyzing, understanding, and resolving legal conflicts
            across all levels of government.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl border border-border-default bg-bg-card hover:bg-bg-elevated transition-colors"
            >
              <div className={`inline-flex p-3 rounded-lg bg-bg-elevated group-hover:bg-bg-card transition-colors mb-4`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
