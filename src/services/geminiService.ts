import OpenAI from 'openai';

export interface FoodItemBreakdown {
  name: string;
  amount: string;
  calories: number;
}

export interface NutritionalData {
  food_item_name: string;
  items?: FoodItemBreakdown[];
  calories: number;
  total_fat: number;
  saturated_fat: number;
  trans_fat: number;
  cholesterol: number;
  sodium: number;
  total_carbohydrates: number;
  dietary_fiber: number;
  total_sugars: number;
  protein: number;
  analysis_notes?: string;
}

export interface AnalysisResult {
  isFood: boolean;
  nutritionalData?: NutritionalData;
  error?: string;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const openai = GROQ_API_KEY
  ? new OpenAI({
      apiKey: GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
      dangerouslyAllowBrowser: true,
    })
  : null;

export async function analyzeMeal(mealDescription: string): Promise<AnalysisResult> {
  if (!GROQ_API_KEY || !openai) {
    return {
      isFood: false,
      error: 'Groq API key is not configured. Please add VITE_GROQ_API_KEY to your .env file.',
    };
  }

  try {
    const prompt = `You are an expert nutritionist AI. Analyze the user's text, which may contain multiple food items and vague portions (e.g., "handful", "a little bit", "bowl").

STRICT RULES:
Rule 1: If the user gives vague amounts like "handful", "splash", "a bit", or "piece", YOU MUST ESTIMATE standard serving sizes (e.g., handful = 30g). Do NOT fail.
Rule 2: Process EVERY item in the list. Sum their individual nutrients together for the total.
Rule 3: If a specific item is impossible to identify, do not fail the whole request. Instead, ignore that item and add a message to the "analysis_notes" field saying "Skipped [item name]: could not identify".
Rule 4: Break down each food item with its estimated amount and individual calories in the "items" array.
Rule 5: Return the JSON with the breakdown so users can validate your interpretation.

Food description: "${mealDescription}"

If this IS food, respond ONLY with a valid JSON object in this exact format (no additional text):
{
  "isFood": true,
  "food_item_name": "<summary string of the meal>",
  "items": [
    {"name": "<food name>", "amount": "<amount with unit>", "calories": <number>},
    {"name": "<food name>", "amount": "<amount with unit>", "calories": <number>}
  ],
  "calories": <total number>,
  "total_fat": <number in grams>,
  "saturated_fat": <number in grams>,
  "trans_fat": <number in grams>,
  "cholesterol": <number in milligrams>,
  "sodium": <number in milligrams>,
  "total_carbohydrates": <number in grams>,
  "dietary_fiber": <number in grams>,
  "total_sugars": <number in grams>,
  "protein": <number in grams>,
  "analysis_notes": <string or omit if no notes>
}

If this IS NOT food, respond ONLY with:
{
  "isFood": false
}

Important:
- Provide realistic estimates based on typical portion sizes
- All values should be numbers (decimals are fine)
- For multiple items, sum up ALL nutritional values into ONE total
- The "items" array should contain each food item's breakdown
- The "calories" field in each item is that item's individual calorie count
- If any items were skipped, include analysis_notes explaining what was skipped
- Do not include any explanatory text, only the JSON object

Output must be raw JSON only. No markdown formatting.`;

    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const text = completion.choices[0]?.message?.content;

    if (!text) {
      throw new Error('AI returned empty response.');
    }

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    if (!parsed.isFood) {
      return {
        isFood: false,
        error: 'The item you entered does not appear to be food. Please enter a valid food description.',
      };
    }

    const requiredFields = [
      'food_item_name',
      'calories',
      'total_fat',
      'saturated_fat',
      'trans_fat',
      'cholesterol',
      'sodium',
      'total_carbohydrates',
      'dietary_fiber',
      'total_sugars',
      'protein',
    ];

    for (const field of requiredFields) {
      if (field === 'food_item_name') {
        if (typeof parsed[field] !== 'string') {
          throw new Error(`Missing or invalid field: ${field}`);
        }
      } else if (typeof parsed[field] !== 'number') {
        throw new Error(`Missing or invalid nutritional data: ${field}`);
      }
    }

    return {
      isFood: true,
      nutritionalData: {
        food_item_name: parsed.food_item_name,
        calories: parsed.calories,
        total_fat: parsed.total_fat,
        saturated_fat: parsed.saturated_fat,
        trans_fat: parsed.trans_fat,
        cholesterol: parsed.cholesterol,
        sodium: parsed.sodium,
        total_carbohydrates: parsed.total_carbohydrates,
        dietary_fiber: parsed.dietary_fiber,
        total_sugars: parsed.total_sugars,
        protein: parsed.protein,
        ...(parsed.items && Array.isArray(parsed.items) && { items: parsed.items }),
        ...(parsed.analysis_notes && { analysis_notes: parsed.analysis_notes }),
      },
    };
  } catch (error) {
    console.error('Error analyzing meal:', error);
    return {
      isFood: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to analyze meal. Please try again.',
    };
  }
}
