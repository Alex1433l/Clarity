import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { LinkItem, LinkFolder, LinkInput, LinkFolderInput } from '@/types';

export function useLinks() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [folders, setFolders] = useState<LinkFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [linksRes, foldersRes] = await Promise.all([
      supabase.from('links').select('*').order('sort_order', { ascending: true }),
      supabase.from('link_folders').select('*').order('sort_order', { ascending: true }),
    ]);
    if (linksRes.error) setError(linksRes.error.message);
    else setLinks(linksRes.data as LinkItem[]);
    if (foldersRes.error) setError(foldersRes.error.message);
    else setFolders(foldersRes.data as LinkFolder[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Folder CRUD
  const createFolder = useCallback(async (input: LinkFolderInput) => {
    const { data, error: err } = await supabase
      .from('link_folders')
      .insert({ name: input.name, sort_order: input.sort_order ?? folders.length })
      .select()
      .single();
    if (err) { setError(err.message); return null; }
    const created = data as LinkFolder;
    setFolders((prev) => [...prev, created]);
    return created;
  }, [folders.length]);

  const updateFolder = useCallback(async (id: string, input: Partial<LinkFolderInput>) => {
    const { data, error: err } = await supabase
      .from('link_folders')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (err) { setError(err.message); return; }
    const updated = data as LinkFolder;
    setFolders((prev) => prev.map((f) => (f.id === id ? updated : f)));
  }, []);

  const deleteFolder = useCallback(async (id: string) => {
    const prev = folders;
    setFolders((prevF) => prevF.filter((f) => f.id !== id));
    setLinks((prevL) => prevL.filter((l) => l.folder_id !== id));
    const { error: err } = await supabase.from('link_folders').delete().eq('id', id);
    if (err) {
      setFolders(prev);
      setError(err.message);
    }
  }, [folders]);

  const reorderFolders = useCallback(async (reordered: LinkFolder[]) => {
    const prev = folders;
    setFolders(reordered);
    const updates = reordered.map((f, i) => ({ id: f.id, sort_order: i }));
    const { error: err } = await supabase.from('link_folders').upsert(updates, { onConflict: 'id' });
    if (err) { setFolders(prev); setError(err.message); }
  }, [folders]);

  // Link CRUD
  const createLink = useCallback(async (input: LinkInput) => {
    const { data, error: err } = await supabase
      .from('links')
      .insert({
        name: input.name,
        url: input.url,
        folder_id: input.folder_id ?? null,
        sort_order: input.sort_order ?? links.length,
      })
      .select()
      .single();
    if (err) { setError(err.message); return null; }
    const created = data as LinkItem;
    setLinks((prev) => [...prev, created]);
    return created;
  }, [links.length]);

  const updateLink = useCallback(async (id: string, input: Partial<LinkInput>) => {
    const { data, error: err } = await supabase
      .from('links')
      .update(input)
      .eq('id', id)
      .select()
      .single();
    if (err) { setError(err.message); return; }
    const updated = data as LinkItem;
    setLinks((prev) => prev.map((l) => (l.id === id ? updated : l)));
  }, []);

  const deleteLink = useCallback(async (id: string) => {
    const prev = links;
    setLinks((prevL) => prevL.filter((l) => l.id !== id));
    const { error: err } = await supabase.from('links').delete().eq('id', id);
    if (err) { setLinks(prev); setError(err.message); }
  }, [links]);

  const reorderLinks = useCallback(async (reordered: LinkItem[]) => {
    const prev = links;
    setLinks(reordered);
    const updates = reordered.map((l, i) => ({ id: l.id, sort_order: i }));
    const { error: err } = await supabase.from('links').upsert(updates, { onConflict: 'id' });
    if (err) { setLinks(prev); setError(err.message); }
  }, [links]);

  return {
    links, folders, loading, error,
    createFolder, updateFolder, deleteFolder, reorderFolders,
    createLink, updateLink, deleteLink, reorderLinks,
    refetch: fetchAll,
  };
}
