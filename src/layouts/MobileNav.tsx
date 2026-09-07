import { NavLink } from 'react-router-dom';
import { navItems } from '@/config/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/utils';

const mobileNav = navItems.slice(0, 5);

export default function MobileNav() {
  const { t } = useLanguage();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/90 dark:bg-sand-900/90 backdrop-blur-lg border-t border-sand-200 dark:border-sand-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around px-2 h-16">
        {mobileNav.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 flex-1 text-[11px] font-medium transition-colors',
                isActive ? 'text-brand-600 dark:text-brand-400' : 'text-sand-400 dark:text-sand-500'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.4 : 2} />
                <span>{t(item.labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
