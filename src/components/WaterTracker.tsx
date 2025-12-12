import { Plus, Minus, Droplets } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface WaterTrackerProps {
  selectedDate: string;
  onUpdate?: () => void;
}

export default function WaterTracker({ selectedDate, onUpdate }: WaterTrackerProps) {
  const [glasses, setGlasses] = useState(0);
  const [loading, setLoading] = useState(false);
  const DAILY_GOAL = 8;

  useEffect(() => {
    fetchWaterLog();
  }, [selectedDate]);

  const fetchWaterLog = async () => {
    try {
      const { data, error } = await supabase
        .from('water_logs')
        .select('glasses')
        .eq('log_date', selectedDate)
        .maybeSingle();

      if (error) throw error;
      setGlasses(data?.glasses || 0);
    } catch (error) {
      console.error('Error fetching water log:', error);
    }
  };

  const updateWaterLog = async (newGlasses: number) => {
    if (newGlasses < 0) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('water_logs')
        .upsert({
          user_id: user.id,
          log_date: selectedDate,
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
      setLoading(false);
    }
  };

  const percentage = Math.min((glasses / DAILY_GOAL) * 100, 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Droplets className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Water Intake</h3>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => updateWaterLog(glasses - 1)}
          disabled={loading || glasses === 0}
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
          disabled={loading}
          className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 text-center mt-2">
        {glasses >= DAILY_GOAL ? 'Goal achieved!' : `${DAILY_GOAL - glasses} more to reach your goal`}
      </p>
    </div>
  );
}
