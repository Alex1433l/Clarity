import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { LearningDocument, LearningDocumentInput } from '@/types';

export function useLearningDocuments() {
  const [documents, setDocuments] = useState<LearningDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('learning_documents')
      .select('*')
      .order('sort_order', { ascending: true });
    if (err) setError(err.message);
    else setDocuments((data ?? []) as LearningDocument[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const createDocument = useCallback(async (input: LearningDocumentInput) => {
    const { data, error: err } = await supabase
      .from('learning_documents')
      .insert({
        title: input.title,
        content: input.content ?? null,
        parent_id: input.parent_id ?? null,
        sort_order: input.sort_order ?? 0,
      })
      .select()
      .single();
    if (err) { setError(err.message); return null; }
    const created = data as LearningDocument;
    setDocuments((prev) => [...prev, created]);
    return created;
  }, []);

  const updateDocument = useCallback(async (id: string, updates: Partial<LearningDocumentInput>) => {
    const { data, error: err } = await supabase
      .from('learning_documents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (err) { setError(err.message); return; }
    const updated = data as LearningDocument;
    setDocuments((prev) => prev.map((d) => (d.id === id ? updated : d)));
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    const prev = documents;
    // Optimistically remove the doc and all its descendants
    const toRemove = new Set<string>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const d of prev) {
        if (d.parent_id && toRemove.has(d.parent_id) && !toRemove.has(d.id)) {
          toRemove.add(d.id);
          changed = true;
        }
      }
    }
    setDocuments((prevDocs) => prevDocs.filter((d) => !toRemove.has(d.id)));
    const { error: err } = await supabase.from('learning_documents').delete().eq('id', id);
    if (err) {
      setDocuments(prev);
      setError(err.message);
    }
  }, [documents]);

  const reorderDocument = useCallback(async (id: string, newParentId: string | null, newSortOrder: number) => {
    const { error: err } = await supabase
      .from('learning_documents')
      .update({ parent_id: newParentId, sort_order: newSortOrder, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (err) setError(err.message);
    else fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents, loading, error,
    createDocument, updateDocument, deleteDocument, reorderDocument,
    refetch: fetchDocuments,
  };
}
