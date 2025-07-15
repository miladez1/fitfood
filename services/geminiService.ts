import { GoogleGenAI, Type } from "@google/genai";
import type { UserInfo, FullPlan } from "../types.ts";

const dietPlanSchema = {
    type: Type.OBJECT,
    properties: {
        daily_calories_goal: { type: Type.INTEGER, description: "کالری هدف روزانه برای کاربر." },
        breakfast: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                calories: { type: Type.INTEGER }
            },
            required: ["name", "description", "calories"]
        },
        lunch: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                calories: { type: Type.INTEGER }
            },
            required: ["name", "description", "calories"]
        },
        dinner: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                calories: { type: Type.INTEGER }
            },
             required: ["name", "description", "calories"]
        },
        snacks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    calories: { type: Type.INTEGER }
                },
                required: ["name", "description", "calories"]
            }
        },
    },
    required: ["daily_calories_goal", "breakfast", "lunch", "dinner", "snacks"]
};

const exercisePlanSchema = {
    type: Type.OBJECT,
    properties: {
        weekly_schedule: {
            type: Type.ARRAY,
            description: "برنامه ورزشی هفتگی. باید شامل 3 تا 5 روز تمرین باشد.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.STRING, description: "روز هفته (مثلا شنبه)." },
                    focus: { type: Type.STRING, description: "عضلات هدف آن روز (مثلا سینه و پشت بازو)." },
                    exercises: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "نام حرکت." },
                                sets: { type: Type.STRING, description: "تعداد ست و تکرار (مثلا 3 ست 12 تکراری)." },
                                description: { type: Type.STRING, description: "توضیح کوتاه در مورد نحوه اجرای حرکت." }
                            },
                             required: ["name", "sets", "description"]
                        }
                    }
                },
                required: ["day", "focus", "exercises"]
            }
        },
        rest_day_recommendation: { type: Type.STRING, description: "توصیه برای روزهای استراحت." }
    },
    required: ["weekly_schedule", "rest_day_recommendation"]
};


export const generatePlan = async (
  userInfo: UserInfo,
  apiKey: string,
  promptTemplate: string
): Promise<FullPlan> => {
  if (!apiKey) {
    throw new Error("کلید API هوش مصنوعی ارائه نشده است.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Replace placeholders in the template to create the final prompt
  const prompt = promptTemplate
    .replace(/{{age}}/g, userInfo.age.toString())
    .replace(/{{gender}}/g, userInfo.gender)
    .replace(/{{weight}}/g, userInfo.weight.toString())
    .replace(/{{height}}/g, userInfo.height.toString())
    .replace(/{{activityLevel}}/g, userInfo.activityLevel)
    .replace(/{{goal}}/g, userInfo.goal)
    .replace(/{{dietaryRestrictions}}/g, userInfo.dietaryRestrictions || 'ندارد')
    .replace(/{{vulnerableBodyParts}}/g, userInfo.vulnerableBodyParts || 'ندارد');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diet_plan: dietPlanSchema,
            exercise_plan: exercisePlanSchema,
          },
          required: ["diet_plan", "exercise_plan"],
        },
      },
    });

    const jsonText = response.text.trim();
    const plan = JSON.parse(jsonText);
    return plan as FullPlan;

  } catch (error) {
    console.error("Error generating plan from Gemini API:", error);
    throw new Error("متاسفانه در تولید برنامه مشکلی پیش آمد. لطفا دوباره تلاش کنید.");
  }
};


export const reimagineImage = async (
    base64Image: string,
    apiKey: string,
    promptTemplate: string
): Promise<string> => {
    if (!apiKey) {
        throw new Error("کلید API لابراتوار عکس تنظیم نشده است.");
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
        // Step 1: Analyze the image and generate a creative prompt
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image.split(',')[1],
            },
        };
        const textPart = {
            text: promptTemplate,
        };

        const descriptionResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        const imagePrompt = descriptionResponse.text.trim();
        console.log("Generated prompt for Imagen:", imagePrompt);


        // Step 2: Generate a new image using the creative prompt
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `${imagePrompt}, dramatic lighting, hyperrealistic, 8k, sharp focus, cinematic`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (imageResponse.generatedImages.length === 0) {
            throw new Error("مدل هوش مصنوعی نتوانست تصویری تولید کند.");
        }

        return imageResponse.generatedImages[0].image.imageBytes;

    } catch (error) {
        console.error("Error reimagining image from Gemini API:", error);
        throw new Error("متاسفانه در بازآفرینی تصویر مشکلی پیش آمد. لطفا دوباره تلاش کنید.");
    }
};