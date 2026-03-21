import { useState, useCallback } from "react";
import LandingPage from "./LandingPage";
import WelcomeScreen from "./screens/WelcomeScreen";
import CreateRoom from "./components/CreateRoom";
import JoinRoom from "./components/JoinRoom";
import UsernameScreen from "./components/UsernameScreen";
import OnboardingLayout from "./components/OnboardingLayout";
import SectionIntro from "./components/SectionIntro";
import TripBasicsForm from "./components/TripBasicsForm";
import PersonaQuestion from "./components/PersonaQuestion";
import TravelInterests from "./components/TravelInterests";
import VibePreferences from "./components/VibePreferences";
import WaitingScreen from "./screens/WaitingScreen";
import VotingScreen from "./screens/VotingScreen";
import ResultScreen from "./screens/ResultScreen";
import { api } from "./api";

export type Step =
  | "landing"
  | "username"
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
  username: string;
  roomCode: string;
  tripBasics: TripBasics;
  persona: { planningStyle: string };
  preferences: Preferences;
}

const defaultFlow: FlowData = {
  path: null,
  username: "",
  roomCode: "",
  tripBasics: { country: "", city: "", travelDates: "", relationship: "" },
  persona: { planningStyle: "" },
  preferences: {
    interests: [],
    environment: 50,
    crowdComfort: 50,
    energyLevel: 50,
    noiseLevel: 50,
  });

  /* ── Handlers ─────────────────────────────────── */

  function handleWelcome(name: string) {
    setUsername(name);
    setStep("create-or-join");
  }

  async function handleCreate() {
    const { code } = await api.createSession(username);
    setSessionCode(code);
    setStep("create-room");
  }

  async function handleJoin(code: string) {
    await api.joinSession(code, username);
    setSessionCode(code);
    setStep("trip-basics-intro");
  }

  async function handlePersonaDone() {
    // Submit persona quiz (trip basics + persona answer) to server
    await api.submitQuiz(sessionCode, username, {
      quizId: "persona",
      answers: [
        { questionId: "country", selected: tripBasics.country },
        { questionId: "city", selected: tripBasics.city },
        { questionId: "travelDates", selected: tripBasics.travelDates },
        { questionId: "relationship", selected: tripBasics.relationship },
        { questionId: "planningStyle", selected: personaAnswer },
      ],
    });
    setStep("prefs-intro");
  }

  if (step === "landing") {
    return <LandingPage onStart={() => setStep("username")} />;
  }

  if (step === "username") {
    return (
      <UsernameScreen
        onNewRoom={(username) => {
          update({ username });
          setStep("create-room");
        }}
        onJoinRoom={(username) => {
          update({ username });
          setStep("join-room");
        }}
        onBack={() => setStep("landing")}
      />
    );
  }

  const handleGeneratingDone = useCallback(() => {
    setStep("voting");
  }, []);

  function handleVotingDone() {
    setStep("result");
  }

  /* ── Onboarding steps (wrapped in OnboardingLayout) ── */

  const onboardingSteps = [
    "trip-basics-intro",
    "trip-basics",
    "persona-intro",
    "persona",
    "prefs-intro",
    "travel-interests",
    "vibe-preferences",
  ];

  if (onboardingSteps.includes(step)) {
    return (
      <OnboardingLayout navSection={navSectionFor(step)}>
        {step === "trip-basics-intro" && (
          <SectionIntro
            part="Part 1 of 3"
            title="Let's start with the basics"
            subtitle="Tell us a little about where and when you're thinking of traveling."
            onNext={() => setStep("trip-basics")}
          />
        )}

        {step === "trip-basics" && (
          <TripBasicsForm
            data={tripBasics}
            onChange={setTripBasics}
            onNext={() => setStep("persona-intro")}
            onBack={() => setStep("trip-basics-intro")}
          />
        )}

        {step === "persona-intro" && (
          <SectionIntro
            part="Part 2 of 3"
            title="What kind of traveler are you?"
            subtitle="We'll use this to find experiences that match your style."
            onNext={() => setStep("persona")}
            onBack={() => setStep("trip-basics")}
          />
        )}

        {step === "persona" && (
          <PersonaQuestion
            value={personaAnswer}
            onChange={setPersonaAnswer}
            onNext={handlePersonaDone}
            onBack={() => setStep("persona-intro")}
          />
        )}

        {step === "prefs-intro" && (
          <SectionIntro
            part="Part 3 of 3"
            title="Your preferences"
            subtitle="Help us understand what you enjoy so we can tailor recommendations."
            onNext={() => setStep("travel-interests")}
            onBack={() => setStep("persona")}
          />
        )}

        {step === "travel-interests" && (
          <TravelInterests
            selected={preferences.interests}
            onChange={(interests) => setPreferences((p) => ({ ...p, interests }))}
            onNext={() => setStep("vibe-preferences")}
            onBack={() => setStep("prefs-intro")}
          />
        )}

        {step === "vibe-preferences" && (
          <VibePreferences
            data={preferences}
            onChange={setPreferences}
            onComplete={handlePrefsComplete}
            onBack={() => setStep("travel-interests")}
          />
        )}
      </OnboardingLayout>
    );
  }

  /* ── Non-onboarding steps ──────────────────────── */

  return (
    <>
      {step === "welcome" && (
        <LandingPage>
          <WelcomeScreen onNext={handleWelcome} />
        </LandingPage>
      )}

      {step === "create-or-join" && (
        <LandingPage>
          <div className="card__content">
            <h2 className="heading">Hi, {username}!</h2>
            <p className="subtitle">Ready to plan a trip together?</p>
            <div className="form" style={{ gap: "12px" }}>
              <button className="form__button" onClick={handleCreate}>
                Start a new trip
              </button>
              <button
                className="form__button form__button--outline"
                onClick={() => setStep("join-room")}
              >
                Join with a code
              </button>
            </div>
          </div>
        </LandingPage>
      )}
      {step === "persona-intro" && (
        <SectionIntro
          part="Part 2"
          title="Now let's get to know your travel styles."
          subtitle="Excited — this is exactly what travel should feel like"
          onNext={() => setStep("persona-question")}
        />
      )}

      {step === "join-room" && (
        <JoinRoom
          onNext={handleJoin}
          onBack={() => setStep("create-or-join")}
        />
      )}
      {step === "activities-intro" && (
        <SectionIntro
          part="Part 3"
          title="And what would you like to do on this trip?"
          subtitle="Excited — this is exactly what travel should feel like"
          onNext={() => setStep("travel-interests")}
        />
      )}

      {step === "voting" && (
        <LandingPage sessionCode={sessionCode}>
          <VotingScreen code={sessionCode} username={username} onDone={handleVotingDone} />
        </LandingPage>
      )}

      {step === "result" && (
        <LandingPage sessionCode={sessionCode}>
          <ResultScreen code={sessionCode} />
        </LandingPage>
      )}
    </>
  );
}
