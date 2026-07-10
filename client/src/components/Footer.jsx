import { Shield } from "lucide-react";

function Footer({ isDark }) {
  return (
    <footer className={`${isDark ? 'bg-[#0A0A0A] border-t border-[#2E2E2E]' : 'bg-white border-t border-[#bbb]'} py-12`}>
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-4 md:mb-0">
          <div className="bg-[#E50914] p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#111]'}`}>InboxGuard</span>
        </div>

        {/* Credits */}
        <div className={`text-center md:text-right ${isDark ? 'text-[#BBBBBB]' : 'text-[#444]'}`}>
          <p>Built by BPIT CSE Students</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-[#888]'}`}>
            
            Ansari <br />
            <span className="mt-1 block">
            
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
