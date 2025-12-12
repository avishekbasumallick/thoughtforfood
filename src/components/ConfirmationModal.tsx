import { X } from 'lucide-react';
import { NutritionalData } from '../services/geminiService';
import { NUTRIENT_LABELS, NUTRIENT_UNITS } from '../lib/constants';

interface ConfirmationModalProps {
  isOpen: boolean;
  mealDescription: string;
  mealDate: string;
  nutritionalData: NutritionalData;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  mealDescription,
  mealDate,
  nutritionalData,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-900">Confirm Meal Details</h2>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Meal Description</h3>
            <p className="text-lg text-gray-800">{mealDescription}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Date</h3>
            <p className="text-lg text-gray-800">{formatDate(mealDate)}</p>
          </div>

          {nutritionalData.analysis_notes && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm font-medium">
                ⚠️ Analysis Notes: {nutritionalData.analysis_notes}
              </p>
            </div>
          )}

          {nutritionalData.items && nutritionalData.items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                AI Interpretation
              </h3>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-3">
                  The AI identified the following items in your meal:
                </p>
                <div className="space-y-2">
                  {nutritionalData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-white px-4 py-2 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-gray-800">{item.name}</span>
                        <span className="text-gray-500 text-sm ml-2">({item.amount})</span>
                      </div>
                      <span className="text-emerald-600 font-semibold">
                        {item.calories.toFixed(0)} kcal
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Total Nutritional Breakdown
            </h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(nutritionalData)
                    .filter(([key]) => !['analysis_notes', 'food_item_name', 'items'].includes(key))
                    .map(([key, value]) => (
                      <tr key={key} className="py-2">
                        <td className="py-3 text-gray-700 font-medium">
                          {NUTRIENT_LABELS[key as keyof typeof NUTRIENT_LABELS]}
                        </td>
                        <td className="py-3 text-right text-gray-900 font-semibold">
                          {typeof value === 'number' ? value.toFixed(1) : value}{' '}
                          {NUTRIENT_UNITS[key as keyof typeof NUTRIENT_UNITS]}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-2xl">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-xl transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Saving...' : 'Confirm & Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
