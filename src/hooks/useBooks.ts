import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Book, BookInput } from '@/types';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('books')
      .select('*')
      .order('sort_order', { ascending: true });
    if (err) setError(err.message);
    else setBooks(data as Book[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const uploadBook = useCallback(async (file: File): Promise<Book | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Não autenticado'); return null; }

    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadErr } = await supabase.storage
      .from('books')
      .upload(filePath, file, { contentType: 'application/epub+zip' });
    if (uploadErr) { setError(uploadErr.message); return null; }

    const input: BookInput = {
      title: file.name.replace(/\.epub$/i, ''),
      file_path: filePath,
      file_size: file.size,
      cover_url: null,
      sort_order: books.length,
    };

    const { data, error: insertErr } = await supabase
      .from('books')
      .insert(input)
      .select()
      .single();
    if (insertErr) { setError(insertErr.message); return null; }

    const created = data as Book;
    setBooks((prev) => [...prev, created]);
    return created;
  }, [books.length]);

  const updateBook = useCallback(async (id: string, updates: Partial<Pick<Book, 'title' | 'author' | 'cover_url' | 'last_read_chapter'>>) => {
    const { data, error: err } = await supabase
      .from('books')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (err) { setError(err.message); return; }
    const updated = data as Book;
    setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
  }, []);

  const deleteBook = useCallback(async (id: string) => {
    const book = books.find((b) => b.id === id);
    if (!book) return;

    if (book.file_path) {
      await supabase.storage.from('books').remove([book.file_path]);
    }

    setBooks((prev) => prev.filter((b) => b.id !== id));
    const { error: err } = await supabase.from('books').delete().eq('id', id);
    if (err) { setError(err.message); fetchBooks(); }
  }, [books, fetchBooks]);

  const getEpubUrl = useCallback(async (book: Book): Promise<string | null> => {
    const { data, error: err } = await supabase.storage
      .from('books')
      .createSignedUrl(book.file_path, 3600);
    if (err) { setError(err.message); return null; }
    return data.signedUrl;
  }, []);

  return { books, loading, error, uploadBook, updateBook, deleteBook, getEpubUrl, refetch: fetchBooks };
}
