export interface LYDPGoal {
  id: string;
  title: string;
  category: "Health" | "Education" | "Livelihood" | "Environment" | "Governance" | "Safety";
  description: string;
  targetYear: number;
}

const DEFAULT_LYDP_GOALS: LYDPGoal[] = [
  {
    id: "goal-1",
    title: "Youth Health Promotion and Mental Wellness Centers",
    category: "Health",
    description: "Establish community mental health peer-support groups and distribute emergency physical wellness kits across all barangays.",
    targetYear: 2026,
  },
  {
    id: "goal-2",
    title: "Digital Literacy & Modern Workspace Upskilling",
    category: "Education",
    description: "Provide free coding camps, hardware repairs seminars, and high-speed satellite learning centers in distant sitios.",
    targetYear: 2027,
  },
  {
    id: "goal-3",
    title: "Youth Agricultural Livelihood & Agri-Preneurship",
    category: "Livelihood",
    description: "Sponsor seed-capital grants and modern farming kits to keep youth integrated with organic, high-yield municipal crops.",
    targetYear: 2026,
  },
  {
    id: "goal-4",
    title: "Barangay Ecological Waste Management & Green Youth Patrol",
    category: "Environment",
    description: "Deploy youth eco-patrol squads to install trash interceptors on creeks and manage neighborhood plastic upcycling centers.",
    targetYear: 2026,
  },
  {
    id: "goal-5",
    title: "Youth-Led Disaster Preparedness & Emergency Response Units",
    category: "Safety",
    description: "Conduct community first-responder certifications and distribute survival backpacks containing water filtration devices.",
    targetYear: 2028,
  }
];

export function getMasterLYDPGoals(): LYDPGoal[] {
  const saved = localStorage.getItem("skompas_master_lydp_goals");
  if (!saved) {
    localStorage.setItem("skompas_master_lydp_goals", JSON.stringify(DEFAULT_LYDP_GOALS));
    return DEFAULT_LYDP_GOALS;
  }
  try {
    return JSON.parse(saved);
  } catch (err) {
    return DEFAULT_LYDP_GOALS;
  }
}

export function saveMasterLYDPGoals(goals: LYDPGoal[]) {
  localStorage.setItem("skompas_master_lydp_goals", JSON.stringify(goals));
}
