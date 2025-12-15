import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase, Meal } from '../lib/supabase';
import { MealEntryForm } from '../components/MealEntryForm';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { DailyProgress } from '../components/DailyProgress';
import { NutritionalData } from '../services/geminiService';
import { TodaysMealsList } from '../components/TodaysMealsList'; // Import the new component

interface DashboardProps {
  onDataUpdate: () => void;
}

export function Dashboard({ onDataUpdate }: DashboardProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pendingMeal, setPendingMeal] = useState<{
    description: string;
    date: string;
    nutritionalData: NutritionalData;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const dailyProgressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMeals();
  }, [selectedDate]); // Re-fetch meals if selectedDate changes

  const fetchMeals = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('meal_date', { ascending: false })
      .order('created_at', { ascending: false }); // Order by creation time for consistent display

    if (error) {
      console.error('Error fetching meals:', error);
    } else {
      setMeals(data || []);
    }
    setLoading(false);
  };

  const handleAnalysisComplete = (
    description: string,
    date: string,
    nutritionalData: NutritionalData
  ) => {
    setPendingMeal({ description, date, nutritionalData });
    setModalOpen(true);
  };

  const handleConfirmMeal = async () => {
    if (!pendingMeal) return;

    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('meals').insert({
      user_id: user.id,
      meal_description: pendingMeal.description,
      meal_date: pendingMeal.date,
      calories: pendingMeal.nutritionalData.calories,
      total_fat: pendingMeal.nutritionalData.total_fat,
      saturated_fat: pendingMeal.nutritionalData.saturated_fat,
      trans_fat: pendingMeal.nutritionalData.trans_fat,
      cholesterol: pendingMeal.nutritionalData.cholesterol,
      sodium: pendingMeal.nutritionalData.sodium,
      total_carbohydrates: pendingMeal.nutritionalData.total_carbohydrates,
      dietary_fiber: pendingMeal.nutritionalData.dietary_fiber,
      total_sugars: pendingMeal.nutritionalData.total_sugars,
      protein: pendingMeal.nutritionalData.protein,
    });

    if (error) {
      console.error('Error saving meal:', error);
      const errorMessage = error.message.includes('maximum limit of 10 meals')
        ? error.message
        : 'Failed to save meal. Please try again.';
      alert(errorMessage);
    } else {
      await fetchMeals(); // Re-fetch all meals to update the list
      onDataUpdate(); // Notify parent that data has changed
      setModalOpen(false);
      setPendingMeal(null);

      setTimeout(() => {
        dailyProgressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }

    setSaving(false);
  };

  const handleCancelMeal = () => {
    setModalOpen(false);
    setPendingMeal(null);
  };

  // Filter meals for the selected date
  const todaysMeals = useMemo(() => {
    return meals.filter(meal => meal.meal_date === selectedDate);
  }, [meals, selectedDate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-16">
        <div
          className="relative h-64 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl sm:text-5xl font-bold mb-2">ThoughtForFood</h1>
              <p className="text-lg sm:text-xl">Track your nutrition, achieve your goals</p>
            </div>
          </div>
        </div>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <MealEntryForm
            onAnalysisComplete={handleAnalysisComplete}
            selectedDate={selectedDate}
            onUpdate={onDataUpdate} // Pass onDataUpdate to MealEntryForm for water log updates
          />

          {/* New section for Today's Meals */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-gray-500 text-center">Loading today's meals...</p>
            </div>
          ) : (
            <TodaysMealsList meals={todaysMeals} selectedDate={selectedDate} />
          )}

          <div ref={dailyProgressRef}>
            {loading ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <p className="text-gray-500 text-center">Loading daily progress...</p>
              </div>
            ) : (
              <DailyProgress meals={meals} selectedDate={selectedDate} onDataUpdate={onDataUpdate} />
            )}
          </div>
        </main>
      </div>

      {pendingMeal && (
        <ConfirmationModal
          isOpen={modalOpen}
          mealDescription={pendingMeal.description}
          mealDate={pendingMeal.date}
          nutritionalData={pendingMeal.nutritionalData}
          onConfirm={handleConfirmMeal}
          onCancel={handleCancelMeal}
          loading={saving}
        />
      )}
    </div>
  );
}