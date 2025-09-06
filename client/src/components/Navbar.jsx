import { Shield, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar({ isMenuOpen, setIsMenuOpen }) {

    const Navigate = useNavigate();

  return (
    <nav className="fixed w-full z-50 bg-[#0A0A0A] border-b border-[#2E2E2E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-[#E50914] p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xl font-bold">InboxGuard</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-[#BBBBBB] hover:text-white">
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-[#BBBBBB] hover:text-white"
              >
                How It Works
              </a>
              <a
                href="#applications"
                className="text-[#BBBBBB] hover:text-white"
              >
                Applications
              </a>
              <button className="bg-[#E50914] hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all" onClick={()=>Navigate('/signin')}>
                Get Started
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white"
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
        <div className="md:hidden bg-[#0A0A0A] border-t border-[#2E2E2E]">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="#features"
              className="block px-3 py-2 text-[#BBBBBB] hover:text-white"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block px-3 py-2 text-[#BBBBBB] hover:text-white"
            >
              How It Works
            </a>
            <a
              href="#applications"
              className="block px-3 py-2 text-[#BBBBBB] hover:text-white"
            >
              Applications
            </a>
            <button className="w-full mt-2 bg-[#E50914] hover:bg-red-700 text-white px-4 py-2 rounded-lg">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
export default Navbar;
