import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Clock, Pencil, Trash2 } from 'lucide-react';
import { Meal } from '../lib/supabase';
import { NUTRIENT_LABELS, NUTRIENT_UNITS } from '../lib/constants';

interface MealHistoryProps {
  meals: Meal[];
  onEdit?: (meal: Meal) => void;
  onDelete?: (mealId: string) => void;
}

export function MealHistory({ meals, onEdit, onDelete }: MealHistoryProps) {
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());

  const groupedMeals = useMemo(() => {
    const groups: { [date: string]: Meal[] } = {};

    meals.forEach((meal) => {
      const date = meal.meal_date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(meal);
    });

    Object.keys(groups).forEach((date) => {
      groups[date].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return Object.entries(groups).sort(([dateA], [dateB]) => {
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [meals]);

  const toggleMeal = (mealId: string) => {
    setExpandedMeals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(mealId)) {
        newSet.delete(mealId);
      } else {
        newSet.add(mealId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const yesterdayOnly = yesterday.toISOString().split('T')[0];

    if (dateOnly === todayOnly) {
      return 'Today';
    } else if (dateOnly === yesterdayOnly) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (meals.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Meal History</h2>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No meals logged yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Start by logging your first meal above
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Meal History</h2>

      <div className="space-y-6">
        {groupedMeals.map(([date, dateMeals]) => (
          <div key={date} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              {formatDate(date)}
            </h3>

            <div className="space-y-3">
              {dateMeals.map((meal) => {
                const isExpanded = expandedMeals.has(meal.id);

                return (
                  <div
                    key={meal.id}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition"
                  >
                    <button
                      onClick={() => toggleMeal(meal.id)}
                      className="w-full text-left"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">
                            {meal.meal_description}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatTime(meal.created_at)}
                            </span>
                            <span className="text-sm font-semibold text-green-600">
                              {Number(meal.calories).toFixed(1)} kcal
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Nutritional Breakdown
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(meal)
                            .filter(
                              ([key]) =>
                                key !== 'id' &&
                                key !== 'user_id' &&
                                key !== 'meal_description' &&
                                key !== 'meal_date' &&
                                key !== 'created_at'
                            )
                            .map(([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-gray-600">
                                  {NUTRIENT_LABELS[key as keyof typeof NUTRIENT_LABELS]}
                                </span>
                                <span className="font-semibold text-gray-800">
                                  {Number(value).toFixed(1)}{' '}
                                  {NUTRIENT_UNITS[key as keyof typeof NUTRIENT_UNITS]}
                                </span>
                              </div>
                            ))}
                        </div>

                        {(onEdit || onDelete) && (
                          <div className="flex gap-2 mt-4">
                            {onEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(meal);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                                Edit
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(meal.id);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
