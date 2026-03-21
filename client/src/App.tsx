import { useState } from "react";
import LandingPage from "./LandingPage";
import CreateRoom from "./components/CreateRoom";
import JoinRoom from "./components/JoinRoom";
import OnboardingLayout from "./components/OnboardingLayout";
import SectionIntro from "./components/SectionIntro";
import TripBasicsForm from "./components/TripBasicsForm";
import PersonaQuestion from "./components/PersonaQuestion";
import TravelInterests from "./components/TravelInterests";
import VibePreferences from "./components/VibePreferences";

export type Step =
  | "landing"
  | "create-room"
  | "join-room"
  | "trip-basics-intro"
  | "trip-basics-form"
  | "persona-intro"
  | "persona-question"
  | "activities-intro"
  | "travel-interests"
  | "vibe-prefs";

export interface TripBasics {
  country: string;
  city: string;
  travelDates: string;
  relationship: string;
}

export interface Preferences {
  interests: string[];
  environment: number;
  crowdComfort: number;
  energyLevel: number;
  noiseLevel: number;
}

export interface FlowData {
  path: "new" | "join" | null;
  roomCode: string;
  tripBasics: TripBasics;
  persona: { planningStyle: string };
  preferences: Preferences;
}

const defaultFlow: FlowData = {
  path: null,
  roomCode: "",
  tripBasics: { country: "", city: "", travelDates: "", relationship: "" },
  persona: { planningStyle: "" },
  preferences: {
    interests: [],
    environment: 50,
    crowdComfort: 50,
    energyLevel: 50,
    noiseLevel: 50,
  },
};

export type NavSection = "trip-basics" | "persona" | "preferences";

function navSectionFor(step: Step): NavSection {
  if (step === "trip-basics-intro" || step === "trip-basics-form") {
    return "trip-basics";
  }
  if (
    step === "persona-intro" ||
    step === "persona-question" ||
    step === "activities-intro"
  ) {
    return "persona";
  }
  return "preferences";
}

export default function App() {
  const [step, setStep] = useState<Step>("landing");
  const [flow, setFlow] = useState<FlowData>(defaultFlow);

  function update(partial: Partial<FlowData>) {
    setFlow((f) => ({ ...f, ...partial }));
  }

  if (step === "landing") {
    return (
      <LandingPage
        onNewRoom={() => setStep("create-room")}
        onJoinRoom={() => setStep("join-room")}
      />
    );
  }

  if (step === "create-room") {
    return (
      <CreateRoom
        onNext={(code) => {
          update({ path: "new", roomCode: code });
          setStep("trip-basics-intro");
        }}
        onBack={() => setStep("landing")}
      />
    );
  }

  if (step === "join-room") {
    return (
      <JoinRoom
        onNext={(code) => {
          update({ path: "join", roomCode: code });
          setStep("persona-intro");
        }}
        onBack={() => setStep("landing")}
      />
    );
  }

  const navSection = navSectionFor(step);

  return (
    <OnboardingLayout navSection={navSection}>
      {step === "trip-basics-intro" && (
        <SectionIntro
          part="Part 1"
          title="Let's get the basics down."
          subtitle="A few quick details so we know where you're headed."
          onNext={() => setStep("trip-basics-form")}
        />
      )}
      {step === "trip-basics-form" && (
        <TripBasicsForm
          data={flow.tripBasics}
          onChange={(tripBasics) => update({ tripBasics })}
          onNext={() => setStep("persona-intro")}
          onBack={() => setStep("trip-basics-intro")}
        />
      )}
      {step === "persona-intro" && (
        <SectionIntro
          part="Part 2"
          title="Now let's get to know your travel styles."
          subtitle="Excited — this is exactly what travel should feel like"
          onNext={() => setStep("persona-question")}
          onBack={() =>
            flow.path === "join"
              ? setStep("join-room")
              : setStep("trip-basics-form")
          }
        />
      )}
      {step === "persona-question" && (
        <PersonaQuestion
          value={flow.persona.planningStyle}
          onChange={(planningStyle) => update({ persona: { planningStyle } })}
          onNext={() => setStep("activities-intro")}
          onBack={() => setStep("persona-intro")}
        />
      )}
      {step === "activities-intro" && (
        <SectionIntro
          part="Part 3"
          title="And what would you like to do on this trip?"
          subtitle="Excited — this is exactly what travel should feel like"
          onNext={() => setStep("travel-interests")}
          onBack={() => setStep("persona-question")}
        />
      )}
      {step === "travel-interests" && (
        <TravelInterests
          selected={flow.preferences.interests}
          onChange={(interests) =>
            update({ preferences: { ...flow.preferences, interests } })
          }
          onNext={() => setStep("vibe-prefs")}
          onBack={() => setStep("activities-intro")}
        />
      )}
      {step === "vibe-prefs" && (
        <VibePreferences
          data={flow.preferences}
          onChange={(preferences) => update({ preferences })}
          onComplete={() => {
            console.log("Flow complete:", flow);
            // TODO: submit to backend
          }}
          onBack={() => setStep("travel-interests")}
        />
      )}
    </OnboardingLayout>
  );
}
