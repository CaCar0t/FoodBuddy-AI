export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other'
}

export enum ActivityLevel {
  Sedentary = 'sedentary', // Little or no exercise
  LightlyActive = 'lightly_active', // Light exercise 1-3 days/week
  ModeratelyActive = 'moderately_active', // Moderate exercise 3-5 days/week
  VeryActive = 'very_active', // Hard exercise 6-7 days/week
  SuperActive = 'super_active' // Very hard exercise & physical job
}

export enum Goal {
  LoseWeight = 'lose_weight',
  MaintainWeight = 'maintain_weight',
  GainMuscle = 'gain_muscle'
}

export interface UserProfile {
  name: string;
  email?: string; // Added email field
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
  customActivity?: string; // User specified activity
  goal: Goal;
  customGoal?: string; // User specified goal
  dietaryRestrictions: string[]; // e.g., "Vegan", "Peanut Allergy"
  bmr?: number;
  tdee?: number;
}

export interface Meal {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  description: string;
  cookingTime?: string;
}

export interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snack?: Meal;
  totalCalories: number;
}

export interface WeeklyPlan {
  days: DayPlan[];
}

export interface HistoryItem {
  id: string;
  date: string; // ISO Date string (YYYY-MM-DD)
  timestamp: number;
  plan: DayPlan;
}