import { useState, useEffect } from 'react';
import { Calendar, Loader2, Plus, X, Minus, Droplets } from 'lucide-react';
import { analyzeMeal, NutritionalData } from '../services/geminiService';
import { supabase } from '../lib/supabase';

interface MealEntryFormProps {
  onAnalysisComplete: (description: string, date: string, nutritionalData: NutritionalData) => void;
  selectedDate: string;
  onUpdate?: () => void;
}

interface FoodItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

const UNITS = [
  'Grams (g)',
  'Ounces (oz)',
  'Cups',
  'Tbsp',
  'Tsp',
  'Slice',
  'Piece',
  'Whole',
  'Handful',
  'Small Bowl',
  'Large Bowl',
  'Serving',
];

type InputMode = 'freetext' | 'builder' | 'water';

export function MealEntryForm({ onAnalysisComplete, selectedDate: propSelectedDate, onUpdate }: MealEntryFormProps) {
  const [inputMode, setInputMode] = useState<InputMode>('freetext');
  const [freeText, setFreeText] = useState('');
  const [foodName, setFoodName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState(UNITS[0]);
  const [items, setItems] = useState<FoodItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [glasses, setGlasses] = useState(0);
  const [waterLoading, setWaterLoading] = useState(false);
  const DAILY_GOAL = 8;

  useEffect(() => {
    if (inputMode === 'water') {
      fetchWaterLog();
    }
  }, [propSelectedDate, inputMode]);

  const fetchWaterLog = async () => {
    try {
      const { data, error } = await supabase
        .from('water_logs')
        .select('glasses')
        .eq('log_date', propSelectedDate)
        .maybeSingle();

      if (error) throw error;
      setGlasses(data?.glasses || 0);
    } catch (error) {
      console.error('Error fetching water log:', error);
    }
  };

  const updateWaterLog = async (newGlasses: number) => {
    if (newGlasses < 0) return;

    setWaterLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('water_logs')
        .upsert({
          user_id: user.id,
          log_date: propSelectedDate,
          glasses: newGlasses,
        }, {
          onConflict: 'user_id,log_date'
        });

      if (error) throw error;
      setGlasses(newGlasses);
      onUpdate?.();
    } catch (error) {
      console.error('Error updating water log:', error);
    } finally {
      setWaterLoading(false);
    }
  };

  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMinDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return date.toISOString().split('T')[0];
  };

  const handleAddItem = () => {
    if (!foodName.trim() || !amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid food name and amount');
      return;
    }

    const newItem: FoodItem = {
      id: Date.now().toString(),
      name: foodName.trim(),
      amount: parseFloat(amount),
      unit: unit,
    };

    setItems([...items, newItem]);
    setFoodName('');
    setAmount('');
    setUnit(UNITS[0]);
    setError('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleAnalyzeFreeText = async () => {
    if (!freeText.trim()) return;

    setError('');
    setLoading(true);

    const result = await analyzeMeal(freeText.trim());

    setLoading(false);

    if (!result.isFood || !result.nutritionalData) {
      setError(result.error || 'Failed to analyze meal');
      return;
    }

    onAnalysisComplete(freeText.trim(), selectedDate, result.nutritionalData);
    setFreeText('');
  };

  const handleCalculateMeal = async () => {
    if (items.length === 0) return;

    setError('');
    setLoading(true);

    const mealDescription = items
      .map(item => `${item.amount} ${item.unit} of ${item.name}`)
      .join(', ');

    const result = await analyzeMeal(mealDescription);

    setLoading(false);

    if (!result.isFood || !result.nutritionalData) {
      setError(result.error || 'Failed to analyze meal');
      return;
    }

    onAnalysisComplete(mealDescription, selectedDate, result.nutritionalData);
    setItems([]);
  };

  const handleSubmit = () => {
    if (inputMode === 'freetext') {
      handleAnalyzeFreeText();
    } else {
      handleCalculateMeal();
    }
  };

  return (
    <div
      className="relative rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      style={{
        backgroundImage: 'url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm" />
      <div className="relative p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Meal</h2>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setInputMode('freetext')}
          disabled={loading}
          className={`flex-1 py-3 px-4 font-medium transition border-b-2 ${
            inputMode === 'freetext'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Free Text
        </button>
        <button
          onClick={() => setInputMode('builder')}
          disabled={loading}
          className={`flex-1 py-3 px-4 font-medium transition border-b-2 ${
            inputMode === 'builder'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Meal Builder
        </button>
        <button
          onClick={() => setInputMode('water')}
          disabled={loading}
          className={`flex-1 py-3 px-4 font-medium transition border-b-2 ${
            inputMode === 'water'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Water Intake
        </button>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {inputMode === 'freetext' ? (
          <div>
            <label htmlFor="freeText" className="block text-sm font-medium text-gray-700 mb-2">
              Describe your meal
            </label>
            <textarea
              id="freeText"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="e.g., 100g rice, 1 chicken thigh, and a handful of broccoli"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition resize-none"
              rows={4}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Describe your meal naturally. The AI will interpret amounts and calculate nutrition.
            </p>
          </div>
        ) : inputMode === 'water' ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Droplets className="w-5 h-5 text-blue-500" />
              <p className="text-sm text-gray-600">Track your daily water intake</p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => updateWaterLog(glasses - 1)}
                disabled={waterLoading || glasses === 0}
                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <Minus className="w-5 h-5 text-gray-700" />
              </button>

              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{glasses}</div>
                <div className="text-sm text-gray-500">of {DAILY_GOAL} glasses</div>
              </div>

              <button
                onClick={() => updateWaterLog(glasses + 1)}
                disabled={waterLoading}
                className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${Math.min((glasses / DAILY_GOAL) * 100, 100)}%` }}
              />
            </div>

            <p className="text-xs text-gray-500 text-center">
              {glasses >= DAILY_GOAL ? 'Goal achieved!' : `${DAILY_GOAL - glasses} more to reach your goal`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
          <div>
            <label htmlFor="foodName" className="block text-sm font-medium text-gray-700 mb-1">
              Food Name
            </label>
            <input
              id="foodName"
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="e.g., Rice, Chicken, Yogurt"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 100"
                min="0"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition bg-white"
                disabled={loading}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

            <button
              type="button"
              onClick={handleAddItem}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Item
            </button>

            {items.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Items in this meal:</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl"
                    >
                      <span className="text-sm text-gray-700">
                        {item.amount} {item.unit} - {item.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 transition disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {inputMode !== 'water' && (
          <>
            <div>
              <label htmlFor="mealDate" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                id="mealDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-gray-900"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                You can log meals up to 7 days in the past
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || (inputMode === 'freetext' ? !freeText.trim() : items.length === 0)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                inputMode === 'freetext' ? 'Analyze Meal' : 'Calculate Total Meal'
              )}
            </button>
          </>
        )}
      </div>
      </div>
    </div>
  );
}