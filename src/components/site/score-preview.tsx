import { ChartIcon, CheckIcon, LockIcon, SparklesIcon } from "@/components/ui/icons";

export function ScorePreview() {
  return (
    <div className="score-preview" aria-label="Example Personality DNA report preview">
      <div className="preview-window-bar">
        <span /><span /><span />
        <small>example-report.vibelytix</small>
      </div>

      <div className="preview-content">
        <div className="preview-header">
          <div>
            <p className="eyebrow"><SparklesIcon /> Personality DNA</p>
            <h3>The Reflective Builder</h3>
            <p>A thoughtful combination of depth, independence and measured ambition.</p>
          </div>
          <div className="preview-score">
            <strong>86</strong>
            <span>profile clarity</span>
          </div>
        </div>

        <div className="trait-grid">
          {[
            ["Emotional depth", "92%"],
            ["Independent thinking", "88%"],
            ["Social selectivity", "79%"],
            ["Action orientation", "68%"]
          ].map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <i><b style={{ width: value }} /></i>
            </div>
          ))}
        </div>

        <div className="preview-insights">
          <div>
            <span className="preview-icon"><ChartIcon /></span>
            <h4>Your edge</h4>
            <p>You notice nuance without losing sight of practical outcomes.</p>
          </div>
          <div>
            <span className="preview-icon"><CheckIcon /></span>
            <h4>Best environment</h4>
            <p>Autonomy, meaningful work and enough quiet time to think deeply.</p>
          </div>
          <div className="locked-preview">
            <span className="preview-icon"><LockIcon /></span>
            <h4>Full action plan</h4>
            <p>Unlock detailed communication, career and relationship guidance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
