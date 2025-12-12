import { useMemo } from 'react';
import { ProgressBar } from './ProgressBar';
import { Meal } from '../lib/supabase';
import { FDA_DAILY_LIMITS, FDA_WEEKLY_LIMITS, NUTRIENT_LABELS, NUTRIENT_UNITS } from '../lib/constants';

interface ProgressTrackingProps {
  meals: Meal[];
}

export function ProgressTracking({ meals }: ProgressTrackingProps) {
  const { dailyTotals, weeklyTotals } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const todayMeals = meals.filter((meal) => meal.meal_date === today);
    const weekMeals = meals.filter(
      (meal) => new Date(meal.meal_date) >= sevenDaysAgo
    );

    const calculateTotals = (mealList: Meal[]) => {
      return {
        calories: mealList.reduce((sum, m) => sum + Number(m.calories), 0),
        total_fat: mealList.reduce((sum, m) => sum + Number(m.total_fat), 0),
        saturated_fat: mealList.reduce((sum, m) => sum + Number(m.saturated_fat), 0),
        trans_fat: mealList.reduce((sum, m) => sum + Number(m.trans_fat), 0),
        cholesterol: mealList.reduce((sum, m) => sum + Number(m.cholesterol), 0),
        sodium: mealList.reduce((sum, m) => sum + Number(m.sodium), 0),
        total_carbohydrates: mealList.reduce((sum, m) => sum + Number(m.total_carbohydrates), 0),
        dietary_fiber: mealList.reduce((sum, m) => sum + Number(m.dietary_fiber), 0),
        total_sugars: mealList.reduce((sum, m) => sum + Number(m.total_sugars), 0),
        protein: mealList.reduce((sum, m) => sum + Number(m.protein), 0),
      };
    };

    return {
      dailyTotals: calculateTotals(todayMeals),
      weeklyTotals: calculateTotals(weekMeals),
    };
  }, [meals]);

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
    <div className="bg-white rounded-xl shadow-md p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Daily Progress</h2>
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
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Weekly Progress</h2>
        <div className="space-y-4">
          {nutrients.map((nutrient) => (
            <ProgressBar
              key={`weekly-${nutrient}`}
              label={NUTRIENT_LABELS[nutrient]}
              current={weeklyTotals[nutrient]}
              limit={FDA_WEEKLY_LIMITS[nutrient]}
              unit={NUTRIENT_UNITS[nutrient]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
