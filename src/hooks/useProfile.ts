import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface Profile {
  user_id: string;
  username: string;
  avatar_path: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
}

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_path, onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      setError('Não foi possível carregar o perfil.');
      setLoading(false);
      return;
    }

    let profileData = data;
    if (!profileData) {
      const { data: createdProfile } = await supabase.from('profiles').upsert({
        user_id: user.id,
        username: 'Alex',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' }).select('user_id, username, avatar_path, onboarding_completed').maybeSingle();
      profileData = createdProfile;
    }

    if (!profileData) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let avatarUrl: string | null = null;
    if (profileData.avatar_path) {
      const { data: signedUrl } = await supabase.storage.from('avatars').createSignedUrl(profileData.avatar_path, 3600);
      avatarUrl = signedUrl?.signedUrl ?? null;
    }

    setProfile({ ...profileData, avatar_url: avatarUrl });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const saveProfile = useCallback(async (username: string, avatarPath?: string | null) => {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) return 'Sessão expirada. Entre novamente.';

    const cleanUsername = username.trim();
    if (cleanUsername.length < 2 || cleanUsername.length > 40) return 'O nome deve ter entre 2 e 40 caracteres.';

    const { error: saveError } = await supabase.from('profiles').upsert({
      user_id: currentUser.user.id,
      username: cleanUsername,
      ...(avatarPath !== undefined && { avatar_path: avatarPath }),
      updated_at: new Date().toISOString(),
    });

    if (saveError) {
      if (saveError.code === '23505') return 'Esse nome de usuário já está em uso.';
      return 'Não foi possível salvar o perfil.';
    }

    await loadProfile();
    return null;
  }, [loadProfile]);

  const completeOnboarding = useCallback(async () => {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) return 'Sessão expirada. Entre novamente.';

    const { error: saveError } = await supabase.from('profiles').upsert({
      user_id: currentUser.user.id,
      username: profile?.username ?? 'Alex',
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });

    if (saveError) return 'Não foi possível salvar esta preferência.';
    await loadProfile();
    return null;
  }, [loadProfile, profile?.username]);

  const uploadAvatar = useCallback(async (file: File) => {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) return { error: 'Sessão expirada. Entre novamente.', path: null };
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) return { error: 'Escolha uma imagem JPG, PNG ou WebP.', path: null };
    if (file.size > MAX_AVATAR_SIZE) return { error: 'A imagem deve ter no máximo 5 MB.', path: null };

    const extension = file.type.split('/')[1].replace('jpeg', 'jpg');
    const path = `${currentUser.user.id}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

    if (uploadError) return { error: 'Não foi possível enviar a imagem.', path: null };
    return { error: null, path };
  }, []);

  return { profile, loading, error, saveProfile, completeOnboarding, uploadAvatar, refetch: loadProfile };
}
