import { useState, type DragEvent } from 'react';
import {
  Link2, Plus, ExternalLink, Trash2, Pencil, Folder, FolderOpen,
  X, Check, GripVertical, Loader2, AlertCircle,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import { useLinks } from '@/hooks/useLinks';
import { useLanguage } from '@/hooks/useLanguage';
import type { LinkItem, LinkFolder } from '@/types';
import { cn } from '@/utils';

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0];
  }
}

function LinkIcon({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  const domain = getDomain(url);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  if (failed) {
    return (
      <div className="w-10 h-10 rounded-xl bg-sand-100 dark:bg-sand-800 flex items-center justify-center shrink-0">
        <Link2 className="w-5 h-5 text-sand-400" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-sand-100 dark:bg-sand-800 flex items-center justify-center shrink-0 overflow-hidden">
      <img
        src={faviconUrl}
        alt=""
        className="w-6 h-6 object-contain"
        onError={() => setFailed(true)}
        loading="lazy"
      />
    </div>
  );
}

interface LinkModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, url: string, folderId: string | null) => void;
  link: LinkItem | null;
  folders: LinkFolder[];
}

function LinkModal({ open, onClose, onSave, link, folders }: LinkModalProps) {
  const [name, setName] = useState(link?.name ?? '');
  const [url, setUrl] = useState(link?.url ?? '');
  const [folderId, setFolderId] = useState<string | null>(link?.folder_id ?? null);

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim() || !url.trim()) return;
    let cleanUrl = url.trim();
    if (!/^https?:\/\//.test(cleanUrl)) cleanUrl = `https://${cleanUrl}`;
    onSave(name.trim(), cleanUrl, folderId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md card p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-sand-800 dark:text-sand-100">{link ? 'Editar link' : 'Novo link'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-sand-500 dark:text-sand-400 mb-1 block">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Gmail" className="input-field" autoFocus />
          </div>
          <div>
            <label className="text-xs font-medium text-sand-500 dark:text-sand-400 mb-1 block">URL</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="input-field" />
          </div>
          <div>
            <label className="text-xs font-medium text-sand-500 dark:text-sand-400 mb-1 block">Pasta</label>
            <select value={folderId ?? ''} onChange={(e) => setFolderId(e.target.value || null)} className="input-field">
              <option value="">Sem pasta</option>
              {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="btn-outline flex-1 text-sm">Cancelar</button>
          <button onClick={handleSubmit} disabled={!name.trim() || !url.trim()} className={cn('btn-primary flex-1 text-sm', (!name.trim() || !url.trim()) && 'opacity-50 cursor-not-allowed')}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

interface FolderModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  folder: LinkFolder | null;
}

function FolderModal({ open, onClose, onSave, folder }: FolderModalProps) {
  const [name, setName] = useState(folder?.name ?? '');

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave(name.trim());
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm card p-5 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-sand-800 dark:text-sand-100">{folder ? 'Editar pasta' : 'Nova pasta'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800"><X className="w-4 h-4" /></button>
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Trabalho" className="input-field" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }} />
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="btn-outline flex-1 text-sm">Cancelar</button>
          <button onClick={handleSubmit} disabled={!name.trim()} className={cn('btn-primary flex-1 text-sm', !name.trim() && 'opacity-50 cursor-not-allowed')}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

export default function LinksPage() {
  const { t } = useLanguage();
  const {
    links, folders, loading, error,
    createFolder, updateFolder, deleteFolder, reorderFolders,
    createLink, updateLink, deleteLink, reorderLinks,
  } = useLinks();

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<LinkFolder | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Drag state for folders
  const [draggedFolderId, setDraggedFolderId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  // Drag state for links
  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);
  const [dragOverLinkId, setDragOverLinkId] = useState<string | null>(null);

  const unassignedLinks = links.filter((l) => !l.folder_id);
  const linksInFolder = (folderId: string) => links.filter((l) => l.folder_id === folderId);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Link handlers
  const openCreateLink = () => { setEditingLink(null); setLinkModalOpen(true); };
  const openEditLink = (link: LinkItem) => { setEditingLink(link); setLinkModalOpen(true); };
  const handleSaveLink = (name: string, url: string, folderId: string | null) => {
    if (editingLink) updateLink(editingLink.id, { name, url, folder_id: folderId });
    else createLink({ name, url, folder_id: folderId });
  };
  const handleDeleteLink = (id: string) => {
    if (confirm('Excluir este link?')) deleteLink(id);
  };

  // Folder handlers
  const openCreateFolder = () => { setEditingFolder(null); setFolderModalOpen(true); };
  const openEditFolder = (folder: LinkFolder) => { setEditingFolder(folder); setFolderModalOpen(true); };
  const handleSaveFolder = (name: string) => {
    if (editingFolder) updateFolder(editingFolder.id, { name });
    else createFolder({ name });
  };
  const handleDeleteFolder = (id: string, name: string) => {
    const count = linksInFolder(id).length;
    const msg = count > 0
      ? `Excluir a pasta "${name}" e seus ${count} link(s)?`
      : `Excluir a pasta "${name}"?`;
    if (confirm(msg)) deleteFolder(id);
  };

  // Folder drag reorder
  const handleFolderDragStart = (e: DragEvent, id: string) => { setDraggedFolderId(id); e.dataTransfer.effectAllowed = 'move'; };
  const handleFolderDragOver = (e: DragEvent, id: string) => { e.preventDefault(); if (draggedFolderId && draggedFolderId !== id) setDragOverFolderId(id); };
  const handleFolderDrop = (e: DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedFolderId || draggedFolderId === targetId) return;
    const fromIdx = folders.findIndex((f) => f.id === draggedFolderId);
    const toIdx = folders.findIndex((f) => f.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...folders];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    reorderFolders(reordered);
    setDraggedFolderId(null); setDragOverFolderId(null);
  };

  // Link drag reorder (within unassigned or within a folder)
  const handleLinkDragStart = (e: DragEvent, id: string) => { setDraggedLinkId(id); e.dataTransfer.effectAllowed = 'move'; };
  const handleLinkDragOver = (e: DragEvent, id: string) => { e.preventDefault(); if (draggedLinkId && draggedLinkId !== id) setDragOverLinkId(id); };
  const handleLinkDrop = (e: DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedLinkId || draggedLinkId === targetId) return;
    const dragged = links.find((l) => l.id === draggedLinkId);
    const target = links.find((l) => l.id === targetId);
    if (!dragged || !target) return;
    // Only reorder within same folder
    if ((dragged.folder_id ?? null) !== (target.folder_id ?? null)) return;
    const siblings = links.filter((l) => (l.folder_id ?? null) === (target.folder_id ?? null));
    const fromIdx = siblings.findIndex((l) => l.id === draggedLinkId);
    const toIdx = siblings.findIndex((l) => l.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...siblings];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    reorderLinks(reordered);
    setDraggedLinkId(null); setDragOverLinkId(null);
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
      <PageHeader title={t('linksTitle')} subtitle={t('linksSubtitle')} icon={Link2}
        action={
          <div className="flex gap-2">
            <button onClick={openCreateFolder} className="btn-outline text-xs sm:text-sm"><Folder className="w-4 h-4" /> Nova pasta</button>
            <button onClick={openCreateLink} className="btn-primary text-xs sm:text-sm"><Plus className="w-4 h-4" /> {t('newLink')}</button>
          </div>
        } />

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {links.length === 0 && folders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sand-100 dark:bg-sand-800 flex items-center justify-center">
            <Link2 className="w-8 h-8 text-sand-300 dark:text-sand-600" />
          </div>
          <p className="text-sm text-sand-400">Nenhum link salvo ainda. Adicione seu primeiro atalho!</p>
          <button onClick={openCreateLink} className="btn-primary text-sm"><Plus className="w-4 h-4" /> {t('newLink')}</button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Folders */}
          {folders.map((folder) => {
            const folderLinks = linksInFolder(folder.id);
            const isExpanded = expandedFolders.has(folder.id);
            return (
              <div
                key={folder.id}
                draggable
                onDragStart={(e) => handleFolderDragStart(e, folder.id)}
                onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                onDrop={(e) => handleFolderDrop(e, folder.id)}
                onDragEnd={() => { setDraggedFolderId(null); setDragOverFolderId(null); }}
                className={cn(
                  'rounded-2xl transition-all',
                  dragOverFolderId === folder.id && draggedFolderId ? 'ring-2 ring-brand-400 dark:ring-brand-600' : ''
                )}
              >
                <Card className="overflow-hidden" hover>
                  {/* Folder header */}
                  <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-sand-50 dark:hover:bg-sand-800/50 transition-colors" onClick={() => toggleFolder(folder.id)}>
                    <GripVertical className="w-4 h-4 text-sand-300 dark:text-sand-700 shrink-0 cursor-grab active:cursor-grabbing" />
                    <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                      {isExpanded
                        ? <FolderOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        : <Folder className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-sand-800 dark:text-sand-100">{folder.name}</p>
                      <p className="text-xs text-sand-400">{folderLinks.length} {folderLinks.length === 1 ? 'link' : 'links'}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEditFolder(folder)} className="p-1.5 rounded-lg text-sand-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteFolder(folder.id, folder.name)} className="p-1.5 rounded-lg text-sand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Folder links */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in">
                      {folderLinks.length === 0 ? (
                        <p className="text-xs text-sand-400 text-center py-3 col-span-full">Pasta vazia</p>
                      ) : (
                        folderLinks.map((link) => (
                          <div
                            key={link.id}
                            draggable
                            onDragStart={(e) => handleLinkDragStart(e, link.id)}
                            onDragOver={(e) => handleLinkDragOver(e, link.id)}
                            onDrop={(e) => handleLinkDrop(e, link.id)}
                            onDragEnd={() => { setDraggedLinkId(null); setDragOverLinkId(null); }}
                            className={cn(
                              'group flex items-center gap-3 p-3 rounded-xl transition-colors',
                              dragOverLinkId === link.id && draggedLinkId ? 'bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-300 dark:ring-brand-700' : 'hover:bg-sand-50 dark:hover:bg-sand-800/50'
                            )}
                          >
                            <GripVertical className="w-3.5 h-3.5 text-sand-300 dark:text-sand-700 shrink-0 cursor-grab active:cursor-grabbing" />
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                              <LinkIcon url={link.url} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-sand-800 dark:text-sand-100 truncate">{link.name}</p>
                                <p className="text-xs text-sand-400 truncate">{link.url.replace(/^https?:\/\//, '')}</p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-sand-300 dark:text-sand-600 group-hover:text-brand-500 transition-colors shrink-0" />
                            </a>
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditLink(link)} className="p-1 rounded-lg text-sand-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"><Pencil className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDeleteLink(link.id)} className="p-1 rounded-lg text-sand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </Card>
              </div>
            );
          })}

          {/* Unassigned links */}
          {unassignedLinks.length > 0 && (
            <div>
              {folders.length > 0 && <p className="section-title mb-3">Sem pasta</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {unassignedLinks.map((link) => (
                  <div
                    key={link.id}
                    draggable
                    onDragStart={(e) => handleLinkDragStart(e, link.id)}
                    onDragOver={(e) => handleLinkDragOver(e, link.id)}
                    onDrop={(e) => handleLinkDrop(e, link.id)}
                    onDragEnd={() => { setDraggedLinkId(null); setDragOverLinkId(null); }}
                    className={cn(
                      'group card p-4 card-hover flex items-center gap-3 transition-colors',
                      dragOverLinkId === link.id && draggedLinkId ? 'bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-300 dark:ring-brand-700' : ''
                    )}
                  >
                    <GripVertical className="w-3.5 h-3.5 text-sand-300 dark:text-sand-700 shrink-0 cursor-grab active:cursor-grabbing" />
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                      <LinkIcon url={link.url} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-sand-800 dark:text-sand-100 truncate">{link.name}</p>
                        <p className="text-xs text-sand-400 truncate">{link.url.replace(/^https?:\/\//, '')}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-sand-300 dark:text-sand-600 group-hover:text-brand-500 transition-colors shrink-0" />
                    </a>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditLink(link)} className="p-1 rounded-lg text-sand-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteLink(link.id)} className="p-1 rounded-lg text-sand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <LinkModal open={linkModalOpen} onClose={() => setLinkModalOpen(false)} onSave={handleSaveLink} link={editingLink} folders={folders} />
      <FolderModal open={folderModalOpen} onClose={() => setFolderModalOpen(false)} onSave={handleSaveFolder} folder={editingFolder} />
    </div>
  );
}
