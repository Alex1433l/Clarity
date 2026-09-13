import { useState, useRef, useEffect } from 'react';
import {
  Book as BookIcon, Upload, Trash2, Loader2, AlertCircle,
  X, ChevronLeft, ChevronRight, BookOpen, Library,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import { useBooks } from '@/hooks/useBooks';
import { useLanguage } from '@/hooks/useLanguage';
import type { Book } from '@/types';
import { cn } from '@/utils';

export default function BooksPage() {
  const { t } = useLanguage();
  const { books, loading, error, uploadBook, deleteBook, getEpubUrl, updateBook } = useBooks();
  const [uploading, setUploading] = useState(false);
  const [readingBook, setReadingBook] = useState<Book | null>(null);

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith('.epub')) continue;
      await uploadBook(file);
    }
    setUploading(false);
  };

  const handleDelete = (book: Book) => {
    if (confirm(`Excluir "${book.title}"?`)) deleteBook(book.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Biblioteca"
        subtitle="Sua coleção de livros em EPUB"
        icon={Library}
        action={
          <label className="btn-primary text-xs sm:text-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            Adicionar EPUB
            <input
              type="file"
              accept=".epub"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files?.length) handleFileUpload(e.target.files); }}
            />
          </label>
        }
      />

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Enviando arquivo...
        </div>
      )}

      {books.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sand-100 dark:bg-sand-800 flex items-center justify-center">
            <BookIcon className="w-8 h-8 text-sand-300 dark:text-sand-600" />
          </div>
          <p className="text-sm text-sand-400">Nenhum livro na biblioteca. Adicione seus EPUBs!</p>
          <label className="btn-primary text-sm cursor-pointer">
            <Upload className="w-4 h-4" /> Adicionar EPUB
            <input
              type="file"
              accept=".epub"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files?.length) handleFileUpload(e.target.files); }}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {books.map((book) => (
            <div key={book.id} className="group">
              <Card className="overflow-hidden card-hover p-0" hover>
                <div
                  className="relative aspect-[3/4] bg-sand-100 dark:bg-sand-800 cursor-pointer"
                  onClick={() => setReadingBook(book)}
                >
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookIcon className="w-10 h-10 text-sand-300 dark:text-sand-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-sand-800" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-medium text-sand-800 dark:text-sand-100 truncate">{book.title}</p>
                  {book.author && <p className="text-xs text-sand-400 truncate">{book.author}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-sand-400">
                      {book.file_size ? `${(book.file_size / 1024 / 1024).toFixed(1)} MB` : ''}
                    </span>
                    <button
                      onClick={() => handleDelete(book)}
                      className="p-1 rounded-lg text-sand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {readingBook && (
        <EpubReader
          book={readingBook}
          onClose={() => setReadingBook(null)}
          getEpubUrl={getEpubUrl}
          onChapterChange={(chapter) => updateBook(readingBook.id, { last_read_chapter: chapter })}
        />
      )}
    </div>
  );
}

interface EpubReaderProps {
  book: Book;
  onClose: () => void;
  getEpubUrl: (book: Book) => Promise<string | null>;
  onChapterChange: (chapter: string) => void;
}

function EpubReader({ book, onClose, getEpubUrl, onChapterChange }: EpubReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let rend: any = null;

    async function loadBook() {
      try {
        setLoading(true);
        setError(null);
        const url = await getEpubUrl(book);
        if (!url || cancelled) return;

        const ePub = (await import('epubjs')).default;
        const epub = ePub(url);
        rend = epub.renderTo(viewerRef.current!, {
          width: '100%',
          height: '100%',
          spread: 'none',
        });
        rend.display();

        if (book.last_read_chapter) {
          try { rend.display(book.last_read_chapter); } catch { /* ignore */ }
        }

        rend.on('relocated', (location: any) => {
          if (location?.start?.href) {
            onChapterChange(location.start.href);
          }
        });

        if (!cancelled) {
          setRendition(rend);
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message ?? 'Erro ao carregar livro');
          setLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      cancelled = true;
      if (rend) { try { rend.destroy(); } catch { /* ignore */ } }
    };
  }, [book.id]);

  const prevPage = () => { rendition?.prevPage(); };
  const nextPage = () => { rendition?.nextPage(); };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-sand-950 flex flex-col">
      <div className="flex items-center justify-between px-4 h-12 border-b border-sand-200 dark:border-sand-800 shrink-0">
        <button onClick={onClose} className="p-2 rounded-lg text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800">
          <X className="w-5 h-5" />
        </button>
        <p className="text-sm font-medium text-sand-800 dark:text-sand-100 truncate max-w-xs">{book.title}</p>
        <div className="flex items-center gap-1">
          <button onClick={prevPage} className="p-2 rounded-lg text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextPage} className="p-2 rounded-lg text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}
        <div ref={viewerRef} className="w-full h-full" />
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-sand-200 dark:border-sand-800 shrink-0">
        <button onClick={prevPage} className="btn-ghost text-xs"><ChevronLeft className="w-4 h-4" /> Anterior</button>
        <button onClick={nextPage} className="btn-ghost text-xs">Próximo <ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
