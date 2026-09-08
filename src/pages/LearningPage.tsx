import { useState, useEffect, useRef, useCallback, type DragEvent } from 'react';
import {
  GraduationCap, Plus, FileText, ChevronRight, ChevronDown,
  Trash2, Loader2, AlertCircle, Bold, Italic, Underline,
  CaseUpper, Heading1, Heading2, Heading3, List, ListOrdered,
  Palette, Save, Check, FilePlus, Folder,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useLearningDocuments } from '@/hooks/useLearningDocuments';
import { useLanguage } from '@/hooks/useLanguage';
import type { LearningDocument } from '@/types';
import { cn } from '@/utils';

const APP_COLORS = [
  { name: 'sand-900', value: 'rgb(28 25 23)' },
  { name: 'brand-600', value: 'rgb(13 148 136)' },
  { name: 'red-500', value: 'rgb(239 68 68)' },
  { name: 'amber-500', value: 'rgb(245 158 11)' },
  { name: 'sky-500', value: 'rgb(14 165 233)' },
  { name: 'violet-500', value: 'rgb(139 92 246)' },
  { name: 'rose-500', value: 'rgb(244 63 94)' },
  { name: 'emerald-500', value: 'rgb(16 185 129)' },
];

interface TreeNodeProps {
  doc: LearningDocument;
  allDocs: LearningDocument[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateSubdoc: (parentId: string) => void;
  onDelete: (id: string) => void;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onDrop: (id: string, parentId: string | null) => void;
  draggedId: string | null;
  setDraggedId: (id: string | null) => void;
  depth: number;
}

function TreeNode({
  doc, allDocs, selectedId, onSelect, onCreateSubdoc, onDelete,
  expanded, onToggle, onDrop, draggedId, setDraggedId, depth,
}: TreeNodeProps) {
  const children = allDocs.filter((d) => d.parent_id === doc.id);
  const hasChildren = children.length > 0;
  const isExpanded = expanded.has(doc.id);

  const [showDropZone, setShowDropZone] = useState(false);

  const handleDragStart = (e: DragEvent) => {
    setDraggedId(doc.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (draggedId && draggedId !== doc.id) setShowDropZone(true);
  };
  const handleDragLeave = () => setShowDropZone(false);
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropZone(false);
    if (draggedId && draggedId !== doc.id) {
      // Prevent dropping into own descendant
      const isDescendant = (id: string, ancestorId: string): boolean => {
        if (id === ancestorId) return true;
        const parent = allDocs.find((d) => d.id === id)?.parent_id;
        if (!parent) return false;
        return isDescendant(parent, ancestorId);
      };
      if (!isDescendant(doc.id, draggedId)) {
        onDrop(draggedId, doc.id);
      }
    }
    setDraggedId(null);
  };

  return (
    <div>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={() => setDraggedId(null)}
        className={cn(
          'group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer text-sm transition-colors',
          selectedId === doc.id
            ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
            : 'hover:bg-sand-100 dark:hover:bg-sand-800/60 text-sand-600 dark:text-sand-300',
          showDropZone && 'ring-2 ring-brand-400 dark:ring-brand-600',
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelect(doc.id)}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(doc.id); }}
          className="shrink-0 w-4 h-4 flex items-center justify-center"
          aria-label="Toggle"
        >
          {hasChildren ? (
            isExpanded
              ? <ChevronDown className="w-3.5 h-3.5 text-sand-400" />
              : <ChevronRight className="w-3.5 h-3.5 text-sand-400" />
          ) : null}
        </button>
        <FileText className={cn('w-3.5 h-3.5 shrink-0', hasChildren ? 'text-brand-500' : 'text-sand-400')} />
        <span className="flex-1 truncate text-xs font-medium">{doc.title || 'Sem título'}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onCreateSubdoc(doc.id); }}
          className="shrink-0 p-0.5 rounded text-sand-300 dark:text-sand-600 hover:text-brand-600 dark:hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Add subdoc"
        >
          <FilePlus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
          className="shrink-0 p-0.5 rounded text-sand-300 dark:text-sand-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.id}
              doc={child}
              allDocs={allDocs}
              selectedId={selectedId}
              onSelect={onSelect}
              onCreateSubdoc={onCreateSubdoc}
              onDelete={onDelete}
              expanded={expanded}
              onToggle={onToggle}
              onDrop={onDrop}
              draggedId={draggedId}
              setDraggedId={setDraggedId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  docId: string;
}

function RichEditor({ content, onChange, docId }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || '';
    }
  }, [docId]); // eslint-disable-line react-hooks/exhaustive-deps

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleUppercase = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();
    if (!selectedText) return;
    const upper = selectedText.toUpperCase();
    range.deleteContents();
    range.insertNode(document.createTextNode(upper));
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const formatButtons = [
    { icon: Bold, command: 'bold', title: 'bold' },
    { icon: Italic, command: 'italic', title: 'italic' },
    { icon: Underline, command: 'underline', title: 'underline' },
  ];

  const headingButtons = [
    { icon: Heading1, command: 'H1', title: 'heading1' },
    { icon: Heading2, command: 'H2', title: 'heading2' },
    { icon: Heading3, command: 'H3', title: 'heading3' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 flex-wrap px-3 py-2 border-b border-sand-200 dark:border-sand-800 bg-sand-50/50 dark:bg-sand-800/30 rounded-t-2xl">
        {formatButtons.map((btn) => (
          <button
            key={btn.command}
            onClick={() => exec(btn.command)}
            className="p-2 rounded-lg text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors"
            title={btn.title}
          >
            <btn.icon className="w-4 h-4" />
          </button>
        ))}
        <div className="w-px h-5 bg-sand-200 dark:bg-sand-700 mx-0.5" />
        <button
          onClick={handleUppercase}
          className="p-2 rounded-lg text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors"
          title="uppercase"
        >
          <CaseUpper className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-sand-200 dark:bg-sand-700 mx-0.5" />
        {headingButtons.map((btn) => (
          <button
            key={btn.command}
            onClick={() => exec('formatBlock', `<${btn.command}>`)}
            className="p-2 rounded-lg text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors"
            title={btn.title}
          >
            <btn.icon className="w-4 h-4" />
          </button>
        ))}
        <div className="w-px h-5 bg-sand-200 dark:bg-sand-700 mx-0.5" />
        <button
          onClick={() => exec('insertUnorderedList')}
          className="p-2 rounded-lg text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors"
          title="bulletList"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => exec('insertOrderedList')}
          className="p-2 rounded-lg text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors"
          title="numberedList"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-sand-200 dark:bg-sand-700 mx-0.5" />
        {/* Color picker */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded-lg text-sand-600 dark:text-sand-300 hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors flex items-center gap-1"
            title="textColor"
          >
            <Palette className="w-4 h-4" />
            <span className="text-[10px] font-medium">A</span>
          </button>
          {showColorPicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)} />
              <div className="absolute left-0 top-full mt-1 z-50 p-2 rounded-xl bg-white dark:bg-sand-900 border border-sand-200 dark:border-sand-800 shadow-elevated">
                <div className="grid grid-cols-4 gap-1.5">
                  {APP_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => { exec('foreColor', color.value); setShowColorPicker(false); }}
                      className="w-7 h-7 rounded-lg border border-sand-200 dark:border-sand-700 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        className="flex-1 overflow-y-auto px-6 py-5 text-sm text-sand-800 dark:text-sand-100 leading-relaxed focus:outline-none min-h-[300px] learning-editor"
        data-placeholder="Comece a escrever..."
      />
    </div>
  );
}

export default function LearningPage() {
  const { t } = useLanguage();
  const {
    documents, loading, error,
    createDocument, updateDocument, deleteDocument, reorderDocument,
  } = useLearningDocuments();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [editingTitle, setEditingTitle] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rootDocs = documents.filter((d) => d.parent_id === null);
  const selectedDoc = documents.find((d) => d.id === selectedId) ?? null;

  useEffect(() => {
    if (selectedDoc) setEditingTitle(selectedDoc.title);
  }, [selectedId, selectedDoc?.title]);

  // Auto-save content
  const handleContentChange = useCallback((html: string) => {
    if (!selectedId) return;
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await updateDocument(selectedId, { content: html });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  }, [selectedId, updateDocument]);

  const handleTitleChange = async (value: string) => {
    setEditingTitle(value);
    if (!selectedId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await updateDocument(selectedId, { title: value });
    }, 800);
  };

  const handleManualSave = async () => {
    if (!selectedId || !editorContentRef.current) return;
    setSaveStatus('saving');
    await updateDocument(selectedId, { content: editorContentRef.current, title: editingTitle });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const editorContentRef = useRef<string>('');

  const handleCreateRoot = async () => {
    const doc = await createDocument({ title: 'Novo documento' });
    if (doc) {
      setSelectedId(doc.id);
      setEditingTitle(doc.title);
    }
  };

  const handleCreateSubdoc = async (parentId: string) => {
    const doc = await createDocument({ title: 'Novo subdocumento', parent_id: parentId, sort_order: documents.filter((d) => d.parent_id === parentId).length });
    if (doc) {
      setExpanded((prev) => new Set(prev).add(parentId));
      setSelectedId(doc.id);
      setEditingTitle(doc.title);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirmDeleteDoc'))) {
      await deleteDocument(id);
      if (selectedId === id) setSelectedId(null);
    }
  };

  const handleToggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDrop = async (id: string, parentId: string | null) => {
    const siblings = documents.filter((d) => d.parent_id === parentId);
    await reorderDocument(id, parentId, siblings.length);
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
        title={t('learning')}
        subtitle={t('learningSubtitle')}
        icon={GraduationCap}
        action={
          <button onClick={handleCreateRoot} className="btn-primary text-xs sm:text-sm">
            <Plus className="w-4 h-4" /> {t('newDoc')}
          </button>
        }
      />

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 h-[calc(100vh-220px)] min-h-[400px]">
        {/* Sidebar: document tree */}
        <div className="card overflow-y-auto no-scrollbar p-2">
          {rootDocs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Folder className="w-8 h-8 text-sand-300 dark:text-sand-700" />
              <p className="text-xs text-sand-400">{t('noDocs')}</p>
              <button onClick={handleCreateRoot} className="btn-primary text-xs">
                <Plus className="w-3.5 h-3.5" /> {t('newDoc')}
              </button>
            </div>
          ) : (
            <div>
              {rootDocs.map((doc) => (
                <TreeNode
                  key={doc.id}
                  doc={doc}
                  allDocs={documents}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onCreateSubdoc={handleCreateSubdoc}
                  onDelete={handleDelete}
                  expanded={expanded}
                  onToggle={handleToggle}
                  onDrop={handleDrop}
                  draggedId={draggedId}
                  setDraggedId={setDraggedId}
                  depth={0}
                />
              ))}
            </div>
          )}
        </div>

        {/* Main: editor */}
        <div className="card overflow-hidden flex flex-col">
          {selectedDoc ? (
            <>
              {/* Title bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-sand-200 dark:border-sand-800">
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder={t('untitledDoc')}
                  className="flex-1 bg-transparent text-base font-semibold text-sand-900 dark:text-white focus:outline-none placeholder:text-sand-300 dark:placeholder:text-sand-600"
                />
                <div className="flex items-center gap-2 shrink-0">
                  {saveStatus === 'saving' && (
                    <span className="text-xs text-sand-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />{t('saving')}
                    </span>
                  )}
                  {saveStatus === 'saved' && (
                    <span className="text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />{t('saved')}
                    </span>
                  )}
                  <button onClick={handleManualSave} className="btn-outline text-xs px-3 py-1.5">
                    <Save className="w-3.5 h-3.5" /> {t('save')}
                  </button>
                </div>
              </div>

              {/* Rich text editor */}
              <RichEditor
                key={selectedDoc.id}
                content={selectedDoc.content ?? ''}
                onChange={(html) => { editorContentRef.current = html; handleContentChange(html); }}
                docId={selectedDoc.id}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-sand-100 dark:bg-sand-800 flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-sand-300 dark:text-sand-600" />
              </div>
              <p className="text-sm font-medium text-sand-500 dark:text-sand-400">{t('noDocs')}</p>
              <p className="text-xs text-sand-400 max-w-[200px]">{t('noDocsDesc')}</p>
              <button onClick={handleCreateRoot} className="btn-primary text-sm mt-1">
                <Plus className="w-4 h-4" /> {t('newDoc')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
