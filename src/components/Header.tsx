import { Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg z-50 relative">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-3">
            <img src="/bus-icon.svg" alt="Bus Icon" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Monterey Transit Explorer
              </h1>
              <p className="text-xs text-primary-100 hidden sm:block">
                Interactive Bus Route Navigation
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
