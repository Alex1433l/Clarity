import { useCallback, useEffect, useState } from 'react';
import { navItems, type NavItem } from '@/config/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

const DEFAULT_LAYOUT = navItems.map((item) => item.id);

type NavigationId = string;

function normalizeLayout(value: unknown): NavigationId[] {
  const validIds = new Set(DEFAULT_LAYOUT);
  const saved = Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string' && validIds.has(id)) : [];
  const unique = [...new Set(saved)];
  for (const id of DEFAULT_LAYOUT) if (!unique.includes(id)) unique.push(id);
  return unique;
}

export function useNavigationLayout() {
  const { user } = useAuth();
  const [layout, setLayout] = useState<NavigationId[]>(DEFAULT_LAYOUT);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoadedUserId(null);
      return;
    }

    let active = true;
    setError(null);
    supabase.from('profiles').select('navigation_layout').eq('user_id', user.id).maybeSingle().then(async ({ data, error: fetchError }) => {
      if (!active) return;
      if (fetchError) {
        setError('Não foi possível carregar a ordem do menu.');
        return;
      }

      if (data?.navigation_layout) {
        setLayout(normalizeLayout(data.navigation_layout));
        setLoadedUserId(user.id);
        return;
      }

      const { error: createError } = await supabase.from('profiles').upsert({
        user_id: user.id,
        username: 'Alex',
        navigation_layout: DEFAULT_LAYOUT,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (!active) return;
      if (createError) {
        setError('Não foi possível salvar a ordem do menu.');
        return;
      }
      setLoadedUserId(user.id);
    });

    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!user || loadedUserId !== user.id) return;
    let active = true;
    supabase.from('profiles').update({ navigation_layout: layout, updated_at: new Date().toISOString() }).eq('user_id', user.id).then(({ error: saveError }) => {
      if (!active || !saveError) return;
      setError('Não foi possível salvar a ordem do menu.');
    });
    return () => { active = false; };
  }, [layout, loadedUserId, user]);

  const reorder = useCallback((fromId: NavigationId, toId: NavigationId) => {
    setLayout((current) => {
      const fromIndex = current.indexOf(fromId);
      const toIndex = current.indexOf(toId);
      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return current;
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const hide = useCallback((id: NavigationId) => {
    setLayout((current) => current.filter((itemId) => itemId !== id));
  }, []);

  const show = useCallback((id: NavigationId) => {
    setLayout((current) => current.includes(id) ? current : [...current, id]);
  }, []);

  const visibleItems: NavItem[] = layout.map((id) => navItems.find((item) => item.id === id)).filter((item): item is NavItem => Boolean(item));
  const hiddenItems = navItems.filter((item) => !layout.includes(item.id));

  return { visibleItems, hiddenItems, reorder, hide, show, error };
}
