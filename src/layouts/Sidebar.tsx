import { useState, type DragEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { X, LogOut, PanelLeftClose, Settings2, GripVertical, Eye, EyeOff, Check } from 'lucide-react';
import { useLanguage, type Language } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useNavigationLayout } from '@/hooks/useNavigationLayout';
import { cn } from '@/utils';

const dailyPhrases: Record<Language, string[]> = {
  pt: [
    'Todo dia é uma nova oportunidade de fazer o que ontem você adiou.',
    'A paz começa quando você aceita que nem tudo está sob seu controle.',
    'A disciplina leva você a lugares onde a motivação não consegue mantê-lo.',
    'Não permita que a opinião alheia se torne a medida do seu valor.',
    'A sabedoria começa quando reconhecemos o quanto ainda temos a aprender.',
    'Você não precisa resolver a vida inteira hoje; cuide com honestidade do próximo passo.',
    'A gentileza custa pouco e pode aliviar um peso que você desconhece.',
    'Não confunda estar ocupado com estar avançando.',
    'A gratidão não exige uma vida perfeita; exige atenção ao bem que ainda existe.',
    'Viva cada dia com coragem para agir, humildade para aprender e gratidão por estar aqui.',
  ],
  es: [
    'Cada día es una nueva oportunidad para hacer lo que ayer pospusiste.',
    'La paz comienza cuando aceptas que no todo está bajo tu control.',
    'La disciplina te lleva a lugares donde la motivación no logra mantenerte.',
    'No permitas que la opinión ajena se convierta en la medida de tu valor.',
    'La sabiduría comienza cuando reconocemos cuánto nos queda por aprender.',
    'No necesitas resolver toda la vida hoy; cuida con honestidad el siguiente paso.',
    'La bondad cuesta poco y puede aliviar un peso que desconoces.',
    'No confundas estar ocupado con estar avanzando.',
    'La gratitud no exige una vida perfecta; exige atención al bien que aún existe.',
    'Vive cada día con valor para actuar, humildad para aprender y gratitud por estar aquí.',
  ],
  en: [
    'Every day is a new opportunity to do what you postponed yesterday.',
    'Peace begins when you accept that not everything is under your control.',
    'Discipline takes you where motivation cannot keep you.',
    'Do not let someone else’s opinion become the measure of your worth.',
    'Wisdom begins when we recognize how much we still have to learn.',
    'You do not have to solve your whole life today; honestly care for the next step.',
    'Kindness costs little and may ease a burden you know nothing about.',
    'Do not confuse being busy with moving forward.',
    'Gratitude does not require a perfect life; it requires noticing the good that remains.',
    'Live each day with courage to act, humility to learn, and gratitude for being here.',
  ],
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onCollapse: () => void;
}

export default function Sidebar({ open, onClose, collapsed, onCollapse }: SidebarProps) {
  const { t, lang } = useLanguage();
  const dailyPhrase = dailyPhrases[lang][Math.floor(Math.random() * dailyPhrases[lang].length)];
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { visibleItems, hiddenItems, reorder, hide, show, error: navigationError } = useNavigationLayout();
  const [editingMenu, setEditingMenu] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    if (draggedId) reorder(draggedId, targetId);
    setDraggedId(null);
  };

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
          <div className="mb-3 flex items-center justify-between px-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sand-400">{t('today')}</span>
            <button
              type="button"
              onClick={() => setEditingMenu((current) => !current)}
              className={cn('rounded-lg p-1.5 transition-colors', editingMenu ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' : 'text-sand-400 hover:bg-sand-100 hover:text-sand-600 dark:hover:bg-sand-800 dark:hover:text-sand-200')}
              aria-label={editingMenu ? t('finishMenuEdit') : t('customizeMenu')}
              title={editingMenu ? t('finishMenuEdit') : t('customizeMenu')}
            >
              {editingMenu ? <Check className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
            </button>
          </div>

          {visibleItems.map((item) => (
            <div
              key={item.id}
              draggable={editingMenu}
              onDragStart={() => setDraggedId(item.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, item.id)}
              className={cn(editingMenu && 'rounded-xl ring-1 ring-dashed ring-sand-200 dark:ring-sand-700')}
            >
              <NavLink
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}
              >
                {editingMenu && <GripVertical className="h-4 w-4 shrink-0 text-sand-300 dark:text-sand-600" />}
                <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
                <span className="flex-1">{t(item.labelKey)}</span>
                {editingMenu && (
                  <button
                    type="button"
                    onClick={(event) => { event.preventDefault(); event.stopPropagation(); hide(item.id); }}
                    className="rounded-md p-1 text-sand-400 hover:bg-sand-200 hover:text-sand-700 dark:hover:bg-sand-700 dark:hover:text-sand-200"
                    aria-label={`${t('hideMenuItem')}: ${t(item.labelKey)}`}
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                )}
              </NavLink>
            </div>
          ))}

          {editingMenu && hiddenItems.length > 0 && (
            <div className="mt-4 border-t border-sand-200 pt-3 dark:border-sand-800">
              <p className="mb-2 px-2 text-[11px] font-medium text-sand-400">{t('showMenuItem')}</p>
              {hiddenItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => show(item.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sand-500 transition-colors hover:bg-sand-100 hover:text-sand-700 dark:text-sand-400 dark:hover:bg-sand-800 dark:hover:text-sand-200"
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                  <span className="flex-1 text-left">{t(item.labelKey)}</span>
                  <Eye className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}
          {editingMenu && navigationError && <p className="px-2 pt-3 text-xs text-red-500">{t('menuSaveError')}</p>}
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
                <p className="text-xs font-medium text-sand-700 dark:text-sand-300 truncate">{profile?.username ?? 'Alex'}</p>
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
            <p className="text-xs text-brand-700/80 dark:text-brand-300/70 mt-0.5 leading-relaxed">{dailyPhrase}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
