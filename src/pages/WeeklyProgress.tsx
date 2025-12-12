import { useEffect, useState } from 'react';
import { supabase, Meal } from '../lib/supabase';
import { ProgressBar } from '../components/ProgressBar';
import { TrendingUp, Droplets, Flame } from 'lucide-react';
import { FDA_WEEKLY_LIMITS, NUTRIENT_LABELS, NUTRIENT_UNITS } from '../lib/constants';

interface WaterLog {
  log_date: string;
  glasses: number;
}

export default function WeeklyProgress() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .gte('meal_date', weekAgoStr)
        .order('meal_date', { ascending: false });

      if (mealsError) throw mealsError;

      const { data: waterData, error: waterError } = await supabase
        .from('water_logs')
        .select('log_date, glasses')
        .gte('log_date', weekAgoStr)
        .order('log_date', { ascending: false });

      if (waterError) throw waterError;

      setMeals(mealsData || []);
      setWaterLogs(waterData || []);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNutrientTotals = () => {
    const totals = {
      calories: 0,
      total_fat: 0,
      saturated_fat: 0,
      trans_fat: 0,
      cholesterol: 0,
      sodium: 0,
      total_carbohydrates: 0,
      dietary_fiber: 0,
      total_sugars: 0,
      protein: 0,
    };

    meals.forEach((meal) => {
      totals.calories += Number(meal.calories);
      totals.total_fat += Number(meal.total_fat);
      totals.saturated_fat += Number(meal.saturated_fat);
      totals.trans_fat += Number(meal.trans_fat);
      totals.cholesterol += Number(meal.cholesterol);
      totals.sodium += Number(meal.sodium);
      totals.total_carbohydrates += Number(meal.total_carbohydrates);
      totals.dietary_fiber += Number(meal.dietary_fiber);
      totals.total_sugars += Number(meal.total_sugars);
      totals.protein += Number(meal.protein);
    });

    return totals;
  };

  const calculateWaterStats = () => {
    const totalGlasses = waterLogs.reduce((sum, log) => sum + log.glasses, 0);
    const daysLogged = waterLogs.length;
    const avgGlasses = daysLogged > 0 ? totalGlasses / 7 : 0;
    const goalMet = waterLogs.filter(log => log.glasses >= 8).length;

    return { totalGlasses, avgGlasses, goalMet };
  };

  const nutrientTotals = calculateNutrientTotals();
  const waterStats = calculateWaterStats();

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

  const totalCalories = nutrientTotals.calories;
  const avgCaloriesPerDay = totalCalories / 7;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 pt-20 pb-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            <h1 className="text-3xl font-bold text-gray-900">Weekly Progress</h1>
          </div>
          <p className="text-gray-500 mt-2">Last 7 days</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Calorie Summary</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Total Calories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalCalories.toFixed(0)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Daily Average</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {avgCaloriesPerDay.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Weekly Nutrient Breakdown
          </h2>
          {meals.length > 0 ? (
            <div className="space-y-4">
              {nutrients.map((nutrient) => (
                <ProgressBar
                  key={`weekly-${nutrient}`}
                  label={NUTRIENT_LABELS[nutrient]}
                  current={nutrientTotals[nutrient]}
                  limit={FDA_WEEKLY_LIMITS[nutrient]}
                  unit={NUTRIENT_UNITS[nutrient]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No meal data for the past week
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Droplets className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900">Water Intake</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">Total Glasses</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {waterStats.totalGlasses}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">Daily Average</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {waterStats.avgGlasses.toFixed(1)}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">Goals Met</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {waterStats.goalMet}/7
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
