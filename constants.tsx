
import { RankTier, WorkoutPlan } from './types';

export const RANK_TIERS: RankTier[] = [
  { minXP: 0, rom: "I", name: "INITIATE", subtitle: "Initialization sequence active.", tooltip: "Entry recorded. No pattern established.", color: "#94a3b8", shape: "rounded-full", anim: "animate-pulse" },
  { minXP: 40, rom: "II", name: "CONSISTENT", subtitle: "Routine establishment detected.", tooltip: "Repeated action detected. Variability remains.", color: "#4ade80", shape: "clip-hexagon", anim: "animate-pulse" },
  { minXP: 120, rom: "III", name: "CONDITIONED", subtitle: "Automated behavioral pattern.", tooltip: "Action occurs with reduced resistance.", color: "#2dd4bf", shape: "clip-hexagon", anim: "animate-pulse" },
  { minXP: 260, rom: "IV", name: "FOCUSED", subtitle: "Resource allocation optimized.", tooltip: "Distractions show declining influence.", color: "#60a5fa", shape: "clip-diamond", anim: "animate-pulse" },
  { minXP: 450, rom: "V", name: "RELENTLESS", subtitle: "Negotiation protocols disabled.", tooltip: "Comfort avoidance observed. Negotiation absent.", color: "#f472b6", shape: "clip-crest", anim: "animate-pulse" },
  { minXP: 700, rom: "VI", name: "ELITE", subtitle: "External impact confirmed.", tooltip: "Performance maintained without reinforcement.", color: "#fbbf24", shape: "clip-star", anim: "animate-pulse" },
  { minXP: 1000, rom: "VII", name: "ASCENDED", subtitle: "Integration complete.", tooltip: "Behavior fully internalized. Monitoring reduced.", color: "#ffffff", shape: "clip-crown", anim: "animate-pulse" }
];

export const WORKOUT_PLANS: Record<string, WorkoutPlan> = {
  Monday: { muscle: "Chest / Triceps", exercises: ["Push-ups: 3 × 12–15", "Incline Push-ups: 3 × 10–12", "Floor DB Fly: 3 × 12", "Close-grip Push-ups: 3 × 8–10", "Overhead DB Tricep Ext: 3 × 12"], masai: false },
  Tuesday: { muscle: "Back / Biceps", exercises: ["Pull-ups / Door Rows: 3 × 6–10", "One-arm DB Row: 3 × 10", "DB RDL (light): 2 × 12", "DB Curl: 3 × 12", "Hammer Curl: 3 × 10–12"], masai: false },
  Wednesday: { muscle: "Legs / Abs / Impact", exercises: ["Squats: 3 × 15", "Forward Lunges: 3 × 10", "Glute Bridges: 3 × 12", "Calf Raises: 3 × 20", "Plank: 3 × 30–45s", "Leg Raises: 3 × 12", "Masai Jumps: 3 × 12–15"], masai: true },
  Thursday: { muscle: "Chest / Shoulders", exercises: ["Decline Push-ups: 3 × 10", "Wide Push-ups: 3 × 12", "Standing DB Press: 3 × 10", "Lateral Raises: 3 × 12–15", "Front Raises: 3 × 12"], masai: false },
  Friday: { muscle: "Back / Biceps (Var)", exercises: ["Towel Row / Band Pull: 3 × 12", "DB Reverse Fly: 3 × 12", "Superman Hold: 3 × 25s", "Concentration Curl: 3 × 10", "Reverse Curl: 3 × 12"], masai: false },
  Saturday: { muscle: "Posture / Flow", exercises: ["Hanging: 5 × 30s", "Wall Posture Hold: 5 × 5m", "Cobra Stretch: 3 × 30s", "Cat–Cow: 3 × 15", "Child’s Pose: 3 × 3m", "Masai Jumps: 4 × 15"], masai: true },
  Sunday: { muscle: "Active Recovery", exercises: ["Walk: 45 min", "Light Stretching: 15 min"], masai: false }
};

export const MEALS_LIST = [
  { id: "bf", label: "Breakfast", detail: "3 eggs, Oatmeal (60g), 2 bananas" },
  { id: "sn", label: "Snack", detail: "Fruit / Peanuts / Curd" },
  { id: "ln", label: "Lunch", detail: "Rice/Roti, Protein 100g, Dal, Salad" },
  { id: "pr", label: "Pre-Work", detail: "Banana + Peanuts" },
  { id: "po", label: "Post-Work", detail: "Milk / 2 Eggs" },
  { id: "dn", label: "Dinner", detail: "Roti, Veg Curry, Protein" },
  { id: "sl", label: "Sleep Ritual", detail: "Warm Milk + Turmeric" }
];

export const POSTURE_LIST = [
  { id: "h", label: "Dead Hang" }, 
  { id: "w", label: "Wall Hold" },
  { id: "c", label: "Cobra" }, 
  { id: "cc", label: "Cat-Cow" }, 
  { id: "cp", label: "Child's Pose" }
];

export const CHAPTER_NAMES = ["Genesis", "Friction", "Momentum", "Pressure", "Threshold", "Stability", "Flow", "Iron", "Ascent"];
