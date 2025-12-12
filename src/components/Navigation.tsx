import { Menu, X, Home, TrendingUp, History, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png'; // Import the new logo

interface NavigationProps {
  onDataUpdate: () => void; // Callback to notify parent of data changes
}

export default function Navigation({ onDataUpdate }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();
  const location = useLocation(); // Get current path for active link styling

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    onDataUpdate(); // Trigger data update after sign out (though usually a full reload happens)
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="ThoughtForFood Logo" className="h-10 w-auto" /> {/* Display the logo, now larger */}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <nav className="space-y-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>

            <Link
              to="/weekly"
              onClick={() => setIsOpen(false)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/weekly'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Weekly Progress</span>
            </Link>

            <Link
              to="/history"
              onClick={() => setIsOpen(false)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/history'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="font-medium">Meal History</span>
            </Link>

            <div className="pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}