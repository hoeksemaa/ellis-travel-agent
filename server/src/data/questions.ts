import type { Quiz } from "../types.js";

export const PERSONA_QUIZ: Quiz = {
  id: "persona",
  title: "Your Travel Persona",
  description:
    "Tell us about your travel style so we can find the perfect match.",
  questions: [
    {
      id: "travel-style",
      question: "What's your travel style?",
      type: "select",
      options: ["Adventurous", "Relaxed", "Cultural", "Foodie", "Nightlife"],
      hasDetails: true,
    },
    {
      id: "budget",
      question: "What's your budget range?",
      type: "select",
      options: ["Budget", "Moderate", "Luxury", "No preference"],
      hasDetails: true,
    },
    {
      id: "pace",
      question: "What pace do you prefer?",
      type: "select",
      options: ["Pack the schedule", "Balanced", "Go with the flow"],
      hasDetails: true,
    },
    {
      id: "accommodation",
      question: "What's your accommodation style?",
      type: "select",
      options: ["Hostel", "Hotel", "Airbnb", "Resort"],
      hasDetails: true,
    },
    {
      id: "experience-level",
      question: "How experienced a traveler are you?",
      type: "select",
      options: [
        "First-time traveler",
        "Occasional",
        "Frequent",
        "Veteran",
      ],
      hasDetails: true,
    },
  ],
};

export const PREFERENCES_QUIZ: Quiz = {
  id: "preferences",
  title: "Trip Preferences",
  description:
    "Now tell us what you're looking for on this specific trip.",
  questions: [
    {
      id: "cuisine",
      question: "What cuisines are you most interested in?",
      type: "multi-select",
      options: [
        "Italian",
        "Japanese",
        "Mexican",
        "Thai",
        "Indian",
        "American",
        "Local / street food",
      ],
      hasDetails: true,
    },
    {
      id: "activities",
      question: "What type of activities do you enjoy?",
      type: "multi-select",
      options: [
        "Outdoor / nature",
        "Museums / history",
        "Nightlife / bars",
        "Shopping",
        "Sports",
        "Beach / relaxation",
      ],
      hasDetails: true,
    },
    {
      id: "time-of-day",
      question: "When are you most active?",
      type: "select",
      options: ["Morning person", "Afternoon", "Night owl", "Flexible"],
      hasDetails: true,
    },
    {
      id: "group-preference",
      question: "Group activity preference?",
      type: "select",
      options: [
        "Just us two",
        "Open to group activities",
        "Mix of both",
      ],
      hasDetails: true,
    },
    {
      id: "must-have",
      question: "What's the must-have for this trip?",
      type: "multi-select",
      options: [
        "Great food",
        "Unique experiences",
        "Relaxation",
        "Instagram-worthy spots",
        "Local culture",
      ],
      hasDetails: true,
    },
  ],
};
