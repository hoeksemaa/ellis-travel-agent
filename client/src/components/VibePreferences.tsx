import type { Preferences } from "../App";
import "./OnboardingLayout.css";
import "./onboarding.css";

interface Props {
  data: Preferences;
  onChange: (data: Preferences) => void;
  onComplete: () => void;
  onBack: () => void;
}

interface SliderConfig {
  key: keyof Omit<Preferences, "interests">;
  label: string;
  min: string;
  mid: string;
  max: string;
}

const SLIDERS: SliderConfig[] = [
  {
    key: "environment",
    label: "Environment",
    min: "Indoor",
    mid: "Neutral",
    max: "Outdoor",
  },
  {
    key: "crowdComfort",
    label: "Crowd comfort",
    min: "Love a crowd",
    mid: "Neutral",
    max: "Avoid crowds",
  },
  {
    key: "energyLevel",
    label: "Energy level",
    min: "Chill",
    mid: "Neutral",
    max: "Outgoing",
  },
  {
    key: "noiseLevel",
    label: "Noise level",
    min: "Quiet",
    mid: "Neutral",
    max: "Loud",
  },
];

export default function VibePreferences({ data, onChange, onComplete, onBack }: Props) {
  function set(key: keyof Omit<Preferences, "interests">, value: number) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="ob-card ob-card--full">
      <span className="ob-card__dot ob-card__dot--tl" />
      <span className="ob-card__dot ob-card__dot--tr" />
      <span className="ob-card__dot ob-card__dot--bl" />
      <span className="ob-card__dot ob-card__dot--br" />
      <span className="ob-card__inset" />

      <div className="ob-card__body">
<h2 className="ob-card__body-title">Vibe preferences</h2>

        <div className="ob-sliders ob-form">
          {SLIDERS.map(({ key, label, min, mid, max }) => (
            <div key={key} className="ob-slider-group">
              <span className="ob-slider-group__label">{label}</span>
              <div className="ob-slider-group__track">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={data[key]}
                  onChange={(e) => set(key, Number(e.target.value))}
                />
              </div>
              <div className="ob-slider-group__ticks">
                <span>{min}</span>
                <span>{mid}</span>
                <span>{max}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="ob-nav">
          <button className="ob-nav__prev" onClick={onBack} aria-label="Back">
            ←
          </button>
          <button className="ob-nav__next" onClick={onComplete}>
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}
