import React from 'react';
import { Meal } from '../lib/supabase';
import { Flame, UtensilsCrossed, Soup } from 'lucide-react';

interface TodaysMealCardProps {
  meal: Meal;
}

export function TodaysMealCard({ meal }: TodaysMealCardProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col space-y-2">
      <p className="text-gray-800 font-medium text-base">{meal.meal_description}</p>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>{meal.calories.toFixed(0)} kcal</span>
        </div>
        <div className="flex items-center space-x-1">
          <UtensilsCrossed className="w-4 h-4 text-purple-500" />
          <span>P: {meal.protein.toFixed(0)}g</span>
        </div>
        <div className="flex items-center space-x-1">
          <Soup className="w-4 h-4 text-blue-500" />
          <span>C: {meal.total_carbohydrates.toFixed(0)}g</span>
        </div>
        <div className="flex items-center space-x-1">
          <Flame className="w-4 h-4 text-red-500" />
          <span>F: {meal.total_fat.toFixed(0)}g</span>
        </div>
      </div>
    </div>
  );
}