import { useMemo } from 'react';
import { ProgressBar } from './ProgressBar';
import { Meal } from '../lib/supabase';
import { FDA_DAILY_LIMITS, NUTRIENT_LABELS, NUTRIENT_UNITS } from '../lib/constants';
import { Calendar } from 'lucide-react';
import { WeeklyWaterIntake } from './WeeklyWaterIntake'; // Import WeeklyWaterIntake

interface DailyProgressProps {
  meals: Meal[];
  selectedDate: string;
  onDataUpdate: () => void; // Add onDataUpdate prop
}

export function DailyProgress({ meals, selectedDate, onDataUpdate }: DailyProgressProps) {
  const dailyTotals = useMemo(() => {
    const dayMeals = meals.filter((meal) => meal.meal_date === selectedDate);

    return {
      calories: dayMeals.reduce((sum, m) => sum + Number(m.calories), 0),
      total_fat: dayMeals.reduce((sum, m) => sum + Number(m.total_fat), 0),
      saturated_fat: dayMeals.reduce((sum, m) => sum + Number(m.saturated_fat), 0),
      trans_fat: dayMeals.reduce((sum, m) => sum + Number(m.trans_fat), 0),
      cholesterol: dayMeals.reduce((sum, m) => sum + Number(m.cholesterol), 0),
      sodium: dayMeals.reduce((sum, m) => sum + Number(m.sodium), 0),
      total_carbohydrates: dayMeals.reduce((sum, m) => sum + Number(m.total_carbohydrates), 0),
      dietary_fiber: dayMeals.reduce((sum, m) => sum + Number(m.dietary_fiber), 0),
      total_sugars: dayMeals.reduce((sum, m) => sum + Number(m.total_sugars), 0),
      protein: dayMeals.reduce((sum, m) => sum + Number(m.protein), 0),
    };
  }, [meals, selectedDate]);

  const nutrients = [
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
  ] as const;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="w-5 h-5 text-emerald-500" />
        <h2 className="text-xl font-semibold text-gray-900">Daily Progress</h2>
      </div>
      <div className="space-y-4">
        {nutrients.map((nutrient) => (
          <ProgressBar
            key={`daily-${nutrient}`}
            label={NUTRIENT_LABELS[nutrient]}
            current={dailyTotals[nutrient]}
            limit={FDA_DAILY_LIMITS[nutrient]}
            unit={NUTRIENT_UNITS[nutrient]}
          />
        ))}
      </div>

      {/* Weekly Water Intake Sub-section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <WeeklyWaterIntake />
      </div>
    </div>
  );
}