import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { UserProfile, Meal, HistoryItem } from "../types";

// ใช้ SDK ตัว Stable
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const flashModelId = "gemini-2.5-flash";
const proModelId = "gemini-2.5-flash";

// --- Schema Definition (ปรับ Syntax เป็น SchemaType ของตัว Stable) ---
const mealSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING, description: "Name of the dish (in Thai)" },
    calories: { type: SchemaType.NUMBER, description: "Approximate calories" },
    protein: { type: SchemaType.NUMBER, description: "Approximate protein in grams" },
    carbs: { type: SchemaType.NUMBER, description: "Approximate carbs in grams" },
    fats: { type: SchemaType.NUMBER, description: "Approximate fats in grams" },
    description: { type: SchemaType.STRING, description: "Short description and key ingredients (in Thai)" },
    cookingTime: { type: SchemaType.STRING, description: "Estimated cooking time e.g., '15 นาที'" },
  },
  required: ["name", "calories", "description"],
};

const dayPlanSchema = {
  type: SchemaType.OBJECT,
  properties: {
    day: { type: SchemaType.STRING, description: "Day name (e.g., วันจันทร์)" },
    breakfast: mealSchema,
    lunch: mealSchema,
    dinner: mealSchema,
    snack: mealSchema,
    totalCalories: { type: SchemaType.NUMBER },
  },
  required: ["day", "breakfast", "lunch", "dinner", "totalCalories"],
};

const weeklyPlanSchema = {
  type: SchemaType.OBJECT,
  properties: {
    days: {
      type: SchemaType.ARRAY,
      items: dayPlanSchema,
    },
  },
  required: ["days"],
};

// --- Helper Functions ---

const buildSystemInstruction = (
  profile: UserProfile, 
  targetCalories: number,
  favorites: Meal[] = [],
  recentHistory: HistoryItem[] = []
) => {
  const activityDesc = profile.customActivity 
    ? `Custom Activity Level: "${profile.customActivity}"` 
    : `Activity Level: ${profile.activityLevel}`;

  const goalDesc = profile.customGoal 
    ? `Custom Goal: "${profile.customGoal}"` 
    : `Goal: ${profile.goal}`;

  const favoriteContext = favorites.length > 0
    ? `\nUser's Favorites: ${favorites.map(m => m.name).join(', ')}.`
    : '';

  return `You are a professional Thai nutritionist (FoodBuddy AI). 
  User Profile: Age ${profile.age}, ${profile.gender}, ${goalDesc}, ${activityDesc}.
  Target: ${targetCalories} kcal/day.
  Restrictions: ${profile.dietaryRestrictions.join(', ') || 'None'}.
  ${favoriteContext}
  
  Generate recommendations in THAI language.
  Tone: Friendly, Encouraging, Modern.
  IMPORTANT: Return only JSON format.
  `;
};

const retryOperation = async <T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryOperation(operation, retries - 1, delay * 2);
  }
};

// --- Main Export Functions ---

export const generateDailyPlan = async (
  profile: UserProfile, 
  targetCalories: number,
  favorites: Meal[] = [],
  history: HistoryItem[] = []
) => {
  return retryOperation(async () => {
    // กำหนด Model และ Config ในขั้นตอน Initial
    const model = genAI.getGenerativeModel({
      model: proModelId,
      systemInstruction: buildSystemInstruction(profile, targetCalories, favorites, history),
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: dayPlanSchema,
        temperature: 0.7,
      },
    });

    const result = await model.generateContent(`Generate a 1-day meal plan strictly adhering to ${targetCalories} kcal.`);
    return JSON.parse(result.response.text());
  });
};

export const generateWeeklyPlan = async (
  profile: UserProfile, 
  targetCalories: number,
  favorites: Meal[] = []
) => {
  return retryOperation(async () => {
    const model = genAI.getGenerativeModel({
      model: proModelId,
      systemInstruction: buildSystemInstruction(profile, targetCalories, favorites),
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: weeklyPlanSchema,
        temperature: 0.7,
      },
    });

    const result = await model.generateContent(`Generate a 7-day meal plan.`);
    return JSON.parse(result.response.text());
  });
};

export const suggestSingleMeal = async (
  profile: UserProfile, 
  mealType: string, 
  targetCalories: number, 
  context?: string
) => {
  return retryOperation(async () => {
    const model = genAI.getGenerativeModel({
      model: flashModelId,
      systemInstruction: buildSystemInstruction(profile, targetCalories),
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: mealSchema,
        temperature: 0.8,
      },
    });

    const result = await model.generateContent(`Suggest a single ${mealType} menu. ${context || ''}. Limit: ${Math.round(targetCalories / 3)} kcal.`);
    return JSON.parse(result.response.text());
  });
};

export const analyzeFoodImage = async (base64Image: string) => {
  return retryOperation(async () => {
    // Clean base64 string
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const model = genAI.getGenerativeModel({
      model: flashModelId,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: mealSchema,
      }
    });

    const prompt = 'Analyze this food image. Identify the dish name (in Thai), estimate calories, protein, carbs, fats, and provide a short description.';
    
    // รูปแบบข้อมูลรูปภาพสำหรับ Library ตัว Stable
    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    return JSON.parse(result.response.text());
  });
};

export const chatWithNutritionist = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  profile: UserProfile
) => {
  return retryOperation(async () => {
    const model = genAI.getGenerativeModel({
      model: flashModelId,
      systemInstruction: buildSystemInstruction(profile, 2000) + "\nAnswer concisely in Thai.",
    });

    const chat = model.startChat({
        history: history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: h.parts
        }))
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  });
}