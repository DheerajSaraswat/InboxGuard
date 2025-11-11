import { useNavigate } from "react-router-dom";
import { Sun, Moon , Shield , Menu , X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/slices/themeSlice";

function Navbar({ isMenuOpen, setIsMenuOpen, isDark: isDarkProp }) {
  const theme = useSelector((state) => state.theme.mode);
  const isDark = typeof isDarkProp === 'boolean' ? isDarkProp : theme === 'dark';
  const dispatch = useDispatch();

    const Navigate = useNavigate();

  return (
    <nav className={`fixed w-full z-50 ${isDark ? 'bg-[#0A0A0A] border-b border-[#2E2E2E]' : 'bg-white border-b border-[#bbb]'}`}> 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-[#E50914] p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#111]'}`}>InboxGuard</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <a href="#features" className={`${isDark ? 'text-[#BBBBBB] hover:text-white' : 'text-[#444] hover:text-[#E50914]'}`}>Features</a>
              <a href="#how-it-works" className={`${isDark ? 'text-[#BBBBBB] hover:text-white' : 'text-[#444] hover:text-[#E50914]'}`}>How It Works</a>
              <a href="#applications" className={`${isDark ? 'text-[#BBBBBB] hover:text-white' : 'text-[#444] hover:text-[#E50914]'}`}>Applications</a>
              <button
                className="bg-transparent p-2 rounded-full cursor-pointer transition-all"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={() => dispatch(toggleTheme())}
              >
                {isDark ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-[#111]" />}
              </button>
              <button className="bg-[#E50914] hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all" onClick={()=>Navigate('/signin')}>
                Get Started
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            className={`md:hidden ${isDark ? 'text-white' : 'text-[#111]'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className={`md:hidden fixed top-16 left-0 right-0 z-50 ${isDark ? 'bg-[#0A0A0A] border-t border-[#2E2E2E]' : 'bg-white border-t border-[#bbb]'} shadow-lg`}>
            <div className="px-2 pt-2 pb-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <a 
                href="#features" 
                className={`block px-3 py-2 rounded-lg ${isDark ? 'text-[#BBBBBB] hover:text-white hover:bg-[#232326]' : 'text-[#444] hover:text-[#E50914] hover:bg-gray-50'} transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className={`block px-3 py-2 rounded-lg ${isDark ? 'text-[#BBBBBB] hover:text-white hover:bg-[#232326]' : 'text-[#444] hover:text-[#E50914] hover:bg-gray-50'} transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#applications" 
                className={`block px-3 py-2 rounded-lg ${isDark ? 'text-[#BBBBBB] hover:text-white hover:bg-[#232326]' : 'text-[#444] hover:text-[#E50914] hover:bg-gray-50'} transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Applications
              </a>
              <button
                className={`w-full mt-2 bg-transparent p-2 rounded-lg transition-all flex items-center justify-center ${isDark ? 'hover:bg-[#232326]' : 'hover:bg-gray-50'}`}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={() => {
                  dispatch(toggleTheme());
                  setIsMenuOpen(false);
                }}
              >
                {isDark ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-[#111]" />}
                <span className={`ml-2 ${isDark ? 'text-white' : 'text-[#111]'}`}>{isDark ? 'Light' : 'Dark'} Mode</span>
              </button>
              <button 
                className="w-full mt-2 bg-[#E50914] hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all font-medium"
                onClick={() => {
                  Navigate('/signin');
                  setIsMenuOpen(false);
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
export default Navbar;
