import { AlertTriangle } from 'lucide-react';

export function GraphLegend() {
  return (
    <div className="absolute bottom-4 left-4 p-4 rounded-lg border border-border-default bg-bg-card/90 backdrop-blur-sm">
      <h3 className="text-sm font-medium text-text-primary mb-3">Legend</h3>

      <div className="space-y-3">
        {/* Jurisdiction colors */}
        <div className="space-y-2">
          <p className="text-xs text-text-muted uppercase tracking-wider">Jurisdiction</p>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-federal" />
              <span className="text-xs text-text-secondary">Federal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-state" />
              <span className="text-xs text-text-secondary">State</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-municipal" />
              <span className="text-xs text-text-secondary">Municipal</span>
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="space-y-2">
          <p className="text-xs text-text-muted uppercase tracking-wider">Status</p>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-status-warning flex items-center justify-center">
              <AlertTriangle className="h-2.5 w-2.5 text-bg-primary" />
            </div>
            <span className="text-xs text-text-secondary">Potential Conflict</span>
          </div>
        </div>

        {/* Relationship lines */}
        <div className="space-y-2">
          <p className="text-xs text-text-muted uppercase tracking-wider">Relationships</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-border-strong" />
            <span className="text-xs text-text-secondary">Authorizes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-status-error border-dashed" style={{ borderStyle: 'dashed' }} />
            <span className="text-xs text-text-secondary">Conflicts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
