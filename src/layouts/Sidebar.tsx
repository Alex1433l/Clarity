import { NavLink } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import { navItems } from '@/config/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useLanguage();

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-sand-950/40 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-72 shrink-0 flex flex-col',
          'bg-white dark:bg-sand-900 border-r border-sand-200/80 dark:border-sand-800',
          'transition-transform duration-300 ease-out lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-sand-200/80 dark:border-sand-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <div className="leading-tight">
              <p className="font-display font-extrabold text-lg tracking-tight text-sand-900 dark:text-white">CLARITY</p>
              <p className="text-[11px] text-sand-400 dark:text-sand-500 -mt-0.5">{t('organizeLife')}</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-sand-500 hover:bg-sand-100 dark:hover:bg-sand-800" aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-sand-200/80 dark:border-sand-800">
          <div className="card p-3.5 bg-gradient-to-br from-brand-50 to-brand-100/60 dark:from-brand-900/30 dark:to-brand-900/10 border-brand-200/60 dark:border-brand-800/40">
            <p className="text-sm font-semibold text-brand-800 dark:text-brand-200">{t('findClarity')}</p>
            <p className="text-xs text-brand-700/80 dark:text-brand-300/70 mt-0.5 leading-relaxed">{t('findClarityDesc')}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
