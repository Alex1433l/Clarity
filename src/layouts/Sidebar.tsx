import { NavLink } from 'react-router-dom';
import { X, LogOut, PanelLeftClose } from 'lucide-react';
import { navItems } from '@/config/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onCollapse: () => void;
}

export default function Sidebar({ open, onClose, collapsed, onCollapse }: SidebarProps) {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();

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
          'transition-transform duration-300 ease-out',
          collapsed ? 'lg:-translate-x-full lg:w-0 lg:border-0 lg:overflow-hidden' : 'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-sand-200/80 dark:border-sand-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sand-100 dark:bg-sand-800 flex items-center justify-center shadow-sm overflow-hidden">
              <img src="/Design_sem_nome__1_-removebg-preview.png" alt="CLARITY" className="w-8 h-8 object-contain" />
            </div>
            <div className="leading-tight">
              <p className="font-display font-extrabold text-lg tracking-tight text-sand-900 dark:text-white">CLARITY</p>
              <p className="text-[11px] text-sand-400 dark:text-sand-500 -mt-0.5">{t('organizeLife')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-sand-400 hover:text-sand-600 dark:hover:text-sand-200 hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors"
              aria-label="Esconder menu"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-sand-500 hover:bg-sand-100 dark:hover:bg-sand-800" aria-label="Close menu">
              <X className="w-5 h-5" />
            </button>
          </div>
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
          {user && (
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">
                  {(user.email ?? '?')[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-sand-700 dark:text-sand-300 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg text-sand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                aria-label={t('logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="card p-3 bg-gradient-to-br from-brand-50 to-brand-100/60 dark:from-brand-900/30 dark:to-brand-900/10 border-brand-200/60 dark:border-brand-800/40">
            <p className="text-sm font-semibold text-brand-800 dark:text-brand-200">{t('findClarity')}</p>
            <p className="text-xs text-brand-700/80 dark:text-brand-300/70 mt-0.5 leading-relaxed">{t('findClarityDesc')}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
