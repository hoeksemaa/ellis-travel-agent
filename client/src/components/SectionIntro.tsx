import bgLandscape from "../assets/bg-landscape.png";
import "./OnboardingLayout.css";
import "./onboarding.css";

interface Props {
  part: string;
  title: string;
  subtitle: string;
  onNext: () => void;
  onBack?: () => void;
}

export default function SectionIntro({ part, title, subtitle, onNext, onBack }: Props) {
  return (
    <div className="ob-card ob-card--split">
      <span className="ob-card__dot ob-card__dot--tl" />
      <span className="ob-card__dot ob-card__dot--tr" />
      <span className="ob-card__dot ob-card__dot--bl" />
      <span className="ob-card__dot ob-card__dot--br" />
      <span className="ob-card__inset" />

      <div className="ob-card__image">
        <img src={bgLandscape} alt="" />
      </div>

      <div className="ob-card__right">
        <p className="ob-section-part">{part}</p>
        <h2 className="ob-section-title">{title}</h2>
        <p className="ob-section-subtitle">{subtitle}</p>

        <div className={`ob-nav${onBack ? "" : " ob-nav--end"}`}>
          {onBack && (
            <button className="ob-nav__prev" onClick={onBack} aria-label="Back">
              ←
            </button>
          )}
          <button className="ob-nav__next" onClick={onNext}>
            Next ▶
          </button>
        </div>
      </div>
    </div>
  );
}
