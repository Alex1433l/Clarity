import {
  Home,
  CheckSquare,
  Flame,
  Target,
  Brain,
  TrendingUp,
  Link2,
  GraduationCap,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { TranslationKey } from '@/hooks/useLanguage';

export interface NavItem {
  id: string;
  labelKey: TranslationKey;
  icon: LucideIcon;
  path: string;
}

export const navItems: NavItem[] = [
  { id: 'today', labelKey: 'today', icon: Home, path: '/' },
  { id: 'tasks', labelKey: 'tasks', icon: CheckSquare, path: '/tarefas' },
  { id: 'habits', labelKey: 'habits', icon: Flame, path: '/habitos' },
  { id: 'mood', labelKey: 'mood', icon: Brain, path: '/meu-estado' },
  { id: 'goals', labelKey: 'goals', icon: Target, path: '/objetivos' },
  { id: 'reports', labelKey: 'reports', icon: TrendingUp, path: '/relatorios' },
  { id: 'links', labelKey: 'links', icon: Link2, path: '/links' },
  { id: 'learning', labelKey: 'learning', icon: GraduationCap, path: '/aprendizado' },
  { id: 'settings', labelKey: 'settings', icon: Settings, path: '/configuracoes' },
];
