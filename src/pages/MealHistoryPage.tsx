import { useEffect, useState } from 'react';
import { supabase, Meal } from '../lib/supabase';
import { MealHistory } from '../components/MealHistory';
import { History } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

function DeleteModal({ isOpen, onClose, onConfirm, title, message }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl transition shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditModalProps {
  isOpen: boolean;
  meal: Meal | null;
  onClose: () => void;
  onSave: (meal: Meal) => void;
}

function EditModal({ isOpen, meal, onClose, onSave }: EditModalProps) {
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [totalCarbohydrates, setTotalCarbohydrates] = useState('');
  const [totalFat, setTotalFat] = useState('');

  useEffect(() => {
    if (meal) {
      setDescription(meal.meal_description);
      setCalories(meal.calories.toString());
      setProtein(meal.protein.toString());
      setTotalCarbohydrates(meal.total_carbohydrates.toString());
      setTotalFat(meal.total_fat.toString());
    }
  }, [meal]);

  if (!isOpen || !meal) return null;

  const handleSave = () => {
    const updatedMeal = {
      ...meal,
      meal_description: description,
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      total_carbohydrates: parseFloat(totalCarbohydrates),
      total_fat: parseFloat(totalFat),
    };
    onSave(updatedMeal);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Meal</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meal Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calories (kcal)
            </label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Protein (g)
            </label>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carbohydrates (g)
            </label>
            <input
              type="number"
              value={totalCarbohydrates}
              onChange={(e) => setTotalCarbohydrates(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Fat (g)
            </label>
            <input
              type="number"
              value={totalFat}
              onChange={(e) => setTotalFat(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              step="0.1"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

interface MealHistoryPageProps {
  onMealDeleted?: () => void;
}

export default function MealHistoryPage({ onMealDeleted }: MealHistoryPageProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [mealToEdit, setMealToEdit] = useState<Meal | null>(null);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('meal_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMeals(data || []);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!mealToDelete) return;

    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealToDelete);

      if (error) {
        console.error('Error deleting meal - Full error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      setMeals(meals.filter(meal => meal.id !== mealToDelete));
      setDeleteModalOpen(false);
      setMealToDelete(null);

      if (onMealDeleted) {
        onMealDeleted(); // Notify parent of data change
      }
    } catch (error) {
      console.error('Error deleting meal - Caught exception:', error);
      alert('Failed to delete meal. Please try again.');
    }
  };

  const handleEdit = (meal: Meal) => {
    setMealToEdit(meal);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedMeal: Meal) => {
    try {
      const { error } = await supabase
        .from('meals')
        .update({
          meal_description: updatedMeal.meal_description,
          calories: updatedMeal.calories,
          protein: updatedMeal.protein,
          total_carbohydrates: updatedMeal.total_carbohydrates,
          total_fat: updatedMeal.total_fat,
        })
        .eq('id', updatedMeal.id);

      if (error) {
        console.error('Error updating meal - Full error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      setMeals(meals.map(meal =>
        meal.id === updatedMeal.id ? updatedMeal : meal
      ));
      setEditModalOpen(false);
      setMealToEdit(null);

      if (onMealDeleted) {
        onMealDeleted(); // Notify parent of data change
      }
    } catch (error) {
      console.error('Error updating meal - Caught exception:', error);
      alert('Failed to update meal. Please try again.');
    }
  };

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
            <History className="w-8 h-8 text-emerald-500" />
            <h1 className="text-3xl font-bold text-gray-900">Meal History</h1>
          </div>
          <p className="text-gray-500 mt-2">All your logged meals</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {meals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500 text-lg">No meals logged yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Start by logging your first meal from the home page
            </p>
          </div>
        ) : (
          <MealHistory
            meals={meals}
            onEdit={handleEdit}
            onDelete={(mealId) => {
              setMealToDelete(mealId);
              setDeleteModalOpen(true);
            }}
          />
        )}
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setMealToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Delete Meal"
        message="Are you sure you want to delete this meal? This action cannot be undone."
      />

      <EditModal
        isOpen={editModalOpen}
        meal={mealToEdit}
        onClose={() => {
          setEditModalOpen(false);
          setMealToEdit(null);
        }}
        onSave={handleSaveEdit}
      />
    </div>
  );
}