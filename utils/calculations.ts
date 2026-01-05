import { UserProfile, Gender, ActivityLevel, Goal } from '../types';

export const calculateBMR = (profile: UserProfile): number => {
  // Mifflin-St Jeor Equation
  let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  
  if (profile.gender === Gender.Male) {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  return Math.round(bmr);
};

export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => {
  const multipliers: Record<ActivityLevel, number> = {
    [ActivityLevel.Sedentary]: 1.2,
    [ActivityLevel.LightlyActive]: 1.375,
    [ActivityLevel.ModeratelyActive]: 1.55,
    [ActivityLevel.VeryActive]: 1.725,
    [ActivityLevel.SuperActive]: 1.9,
  };

  return Math.round(bmr * multipliers[activityLevel]);
};

export const calculateTargetCalories = (tdee: number, goal: Goal): number => {
  switch (goal) {
    case Goal.LoseWeight:
      return Math.round(tdee - 500); // Deficit
    case Goal.GainMuscle:
      return Math.round(tdee + 300); // Surplus
    case Goal.MaintainWeight:
    default:
      return tdee;
  }
};