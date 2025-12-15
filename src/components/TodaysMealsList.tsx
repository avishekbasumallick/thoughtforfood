import React from 'react';
import { Meal } from '../lib/supabase';
import { TodaysMealCard } from './TodaysMealCard';
import { Utensils } from 'lucide-react';

interface TodaysMealsListProps {
  meals: Meal[];
  selectedDate: string;
}

export function TodaysMealsList({ meals, selectedDate }: TodaysMealsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const todayOnly = today.toISOString().split('T')[0];

    if (dateString === todayOnly) {
      return 'Today';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Utensils className="w-5 h-5 text-emerald-500" />
        <h2 className="text-xl font-semibold text-gray-900">{formatDate(selectedDate)}'s Meals</h2>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No meals logged yet for {formatDate(selectedDate)}.</p>
          <p className="text-sm mt-2 text-gray-400">Add your first meal using the form above!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {meals.map((meal) => (
            <TodaysMealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}
    </div>
  );
}