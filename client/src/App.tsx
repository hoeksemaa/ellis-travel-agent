import { useState, useCallback } from "react";
import LandingPage from "./LandingPage";
import UsernameScreen from "./components/UsernameScreen";
import CreateRoom from "./components/CreateRoom";
import JoinRoom from "./components/JoinRoom";
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
  | "waiting-for-partner"
  | "trip-basics-intro"
  | "trip-basics"
  | "persona-intro"
  | "persona"
  | "prefs-intro"
  | "travel-interests"
  | "vibe-preferences"
  | "waiting"
  | "generating"
  | "voting"
  | "result";

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

export type NavSection = "trip-basics" | "persona" | "preferences";

function navSectionFor(step: Step): NavSection {
  if (step === "trip-basics-intro" || step === "trip-basics") return "trip-basics";
  if (step === "persona-intro" || step === "persona") return "persona";
  return "preferences";
}

export default function App() {
  const [step, setStep] = useState<Step>("landing");
  const [fadingIn, setFadingIn] = useState(false);
  const [username, setUsername] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [tripBasics, setTripBasics] = useState<TripBasics>({
    country: "",
    city: "",
    travelDates: "",
    relationship: "",
  });
  const [personaAnswer, setPersonaAnswer] = useState("");
  const [preferences, setPreferences] = useState<Preferences>({
    interests: [],
    environment: 50,
    crowdComfort: 50,
    energyLevel: 50,
    noiseLevel: 50,
  });

  /* ── Handlers ─────────────────────────────────── */

  async function handleNewRoom(name: string) {
    setUsername(name);
    try {
      console.log("[App] Creating paired session for user:", name);
      const { code } = await api.createSession(name, false);
      console.log("[App] Session created with code:", code);
      setSessionCode(code);
      setStep("create-room");
    } catch (err: any) {
      console.error("[App] Failed to create session:", err.message);
    }
  }

  async function handleSoloRoom(name: string) {
    setUsername(name);
    try {
      console.log("[App] Creating solo session for user:", name);
      const { code } = await api.createSession(name, true);
      console.log("[App] Solo session created with code:", code);
      setSessionCode(code);
      setStep("trip-basics-intro");
    } catch (err: any) {
      console.error("[App] Failed to create solo session:", err.message);
    }
  }

  async function handleJoinRoom(code: string) {
    try {
      console.log("[App] Joining session:", code, "as user:", username);
      await api.joinSession(code, username);
      console.log("[App] Joined session:", code);
      setSessionCode(code);
      setStep("trip-basics-intro");
    } catch (err: any) {
      console.error("[App] Failed to join session:", err.message);
    }
  }

  // Submit both quizzes at the end of the form flow
  async function handleAllQuizzesDone() {
    try {
      console.log("[App] Submitting both quizzes for:", username);

      // Submit persona quiz
      console.log("[App] Submitting persona quiz...");
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
      console.log("[App] Persona quiz submitted");

      // Submit preferences quiz
      console.log("[App] Submitting preferences quiz...");
      const { session } = await api.submitQuiz(sessionCode, username, {
        quizId: "preferences",
        answers: [
          { questionId: "interests", selected: preferences.interests },
          { questionId: "environment", selected: String(preferences.environment) },
          { questionId: "crowdComfort", selected: String(preferences.crowdComfort) },
          { questionId: "energyLevel", selected: String(preferences.energyLevel) },
          { questionId: "noiseLevel", selected: String(preferences.noiseLevel) },
        ],
      });
      console.log("[App] Both quizzes submitted. Session status:", session.status);

      if (session.status === "generating") {
        // Both users done (or solo) — Claude is generating
        setStep("generating");
      } else {
        // Partner hasn't finished yet — single waiting screen
        setStep("waiting");
      }
    } catch (err: any) {
      console.error("[App] Failed to submit quizzes:", err.message);
    }
  }

  const handleGeneratingDone = useCallback(() => {
    console.log("[App] Options generated, moving to voting");
    setStep("voting");
  }, []);

  const handleWaitingDone = useCallback(() => {
    console.log("[App] Partner finished, moving to generating");
    setStep("generating");
  }, []);

  function handleVotingDone() {
    console.log("[App] Votes submitted, moving to result");
    setStep("result");
  }

  /* ── Landing / Username / Room screens ─────────── */

  if (step === "landing") {
    return <LandingPage onStart={() => {
      setFadingIn(true);
      setStep("username");
    }} />;
  }

  if (step === "username") {
    return (
      <>
        {fadingIn && <div className="page-fade-in" onAnimationEnd={() => setFadingIn(false)} />}
        <UsernameScreen
        onNewRoom={handleNewRoom}
        onSolo={handleSoloRoom}
        onJoinRoom={(name) => {
          setUsername(name);
          setStep("join-room");
        }}
        onBack={() => setStep("landing")}
      />
      </>
    );
  }

  if (step === "create-room") {
    return (
      <CreateRoom
        code={sessionCode}
        onNext={() => setStep("waiting-for-partner")}
        onBack={() => setStep("username")}
      />
    );
  }

  if (step === "join-room") {
    return (
      <JoinRoom
        onNext={handleJoinRoom}
        onBack={() => setStep("username")}
      />
    );
  }

  if (step === "waiting-for-partner") {
    return (
      <WaitingScreen
        code={sessionCode}
        targetStatus="persona_quiz"
        message="Waiting for your partner to join..."
        subMessage={`Share code: ${sessionCode}`}
        onReady={() => {
          console.log("[App] Partner joined, moving to trip basics");
          setStep("trip-basics-intro");
        }}
      />
    );
  }

  /* ── Single waiting screen after all quizzes ── */

  if (step === "waiting") {
    return (
      <WaitingScreen
        code={sessionCode}
        targetStatus={["generating", "voting"]}
        message="Waiting for your partner to finish..."
        subMessage="You're all done! Hang tight while they wrap up."
        onReady={handleWaitingDone}
      />
    );
  }

  if (step === "generating") {
    return (
      <WaitingScreen
        code={sessionCode}
        targetStatus="voting"
        message="Finding your perfect trip..."
        subMessage="Our AI is searching for the best options for you."
        onReady={handleGeneratingDone}
      />
    );
  }

  if (step === "voting") {
    return <VotingScreen code={sessionCode} username={username} onDone={handleVotingDone} />;
  }

  if (step === "result") {
    return <ResultScreen code={sessionCode} />;
  }

  /* ── Onboarding steps (wrapped in OnboardingLayout) ── */

  const navSection = navSectionFor(step);

  return (
    <OnboardingLayout navSection={navSection}>
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
          onNext={() => setStep("prefs-intro")}
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
          onComplete={handleAllQuizzesDone}
          onBack={() => setStep("travel-interests")}
        />
      )}
    </OnboardingLayout>
  );
}
