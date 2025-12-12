import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Droplets } from 'lucide-react';

interface WaterLog {
  log_date: string;
  glasses: number;
}

export function WeeklyWaterIntake() {
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [loading, setLoading] = useState(true);
  const DAILY_GOAL = 8; // Assuming a daily goal of 8 glasses

  useEffect(() => {
    fetchWeeklyWaterData();
  }, []);

  const fetchWeeklyWaterData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // Get data for the last 7 days

      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('water_logs')
        .select('log_date, glasses')
        .gte('log_date', sevenDaysAgoStr)
        .order('log_date', { ascending: false });

      if (error) throw error;
      setWaterLogs(data || []);
    } catch (error) {
      console.error('Error fetching weekly water data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWaterStats = () => {
    const totalGlasses = waterLogs.reduce((sum, log) => sum + log.glasses, 0);
    // Calculate average over 7 days, even if not all days have logs
    const avgGlasses = waterLogs.length > 0 ? totalGlasses / 7 : 0;
    const goalMet = waterLogs.filter(log => log.glasses >= DAILY_GOAL).length;

    return { totalGlasses, avgGlasses, goalMet };
  };

  const waterStats = calculateWaterStats();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center text-gray-500">
        Loading water data...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Droplets className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Weekly Water Intake</h3>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">Total Glasses</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {waterStats.totalGlasses}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">Daily Average</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {waterStats.avgGlasses.toFixed(1)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-600">Goals Met</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {waterStats.goalMet}/7
          </p>
        </div>
      </div>
    </div>
  );
}