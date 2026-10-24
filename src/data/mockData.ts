import type {
  Task,
  Goal,
  Prayer,
  JournalEntry,
  LinkItem,
  GratitudeItem,
} from '@/types';

const today = new Date().toISOString().slice(0, 10);

export const mockTasks: Task[] = [
  { id: 't1', title: 'Revisar e-mails do trabalho', done: false, priority: 'high', date: today, time: null, category: 'Trabalho', sort_order: 0 },
  { id: 't2', title: 'Preparar apresentação de segunda', done: false, priority: 'medium', date: today, time: null, category: 'Trabalho', sort_order: 1 },
  { id: 't3', title: 'Comprar mantimentos da semana', done: false, priority: 'low', date: today, time: null, category: 'Pessoal', sort_order: 2 },
  { id: 't4', title: 'Caminhada de 30 minutos', done: true, priority: 'medium', date: today, time: null, category: 'Saúde', sort_order: 3 },
  { id: 't5', title: 'Ligar para o dentista', done: false, priority: 'medium', date: today, time: null, category: 'Pessoal', sort_order: 4 },
];

export const mockGoals: Goal[] = [
  {
    id: 'g1',
    title: 'Aprender espanhol até o nível B1',
    description: 'Estudar 20 minutos por dia e praticar conversação 2x por semana.',
    life_area_id: null,
    deadline: '2026-12-31',
    sort_order: 0,
    progress: 35,
  },
  {
    id: 'g2',
    title: 'Correr meia maratona',
    description: 'Treinar progressivamente até completar 21km.',
    life_area_id: null,
    deadline: '2026-10-15',
    sort_order: 1,
    progress: 50,
  },
  {
    id: 'g3',
    title: 'Ler 12 livros este ano',
    description: 'Um livro por mês, priorizando desenvolvimento pessoal.',
    life_area_id: null,
    deadline: '2026-12-31',
    sort_order: 2,
    progress: 58,
  },
];

export const mockPrayers: Prayer[] = [
  { id: 'p1', title: 'Sabedoria para decisões', category: 'Pessoal', status: 'active', frequency: 'Diária' },
  { id: 'p2', title: 'Saúde da família', category: 'Família', status: 'active', frequency: 'Semanal' },
  { id: 'p3', title: 'Direção profissional', category: 'Carreira', status: 'answered', frequency: 'Diária' },
];

export const mockJournal: JournalEntry[] = [
  { id: 'j1', date: today, mood: 'Calmo', preview: 'Hoje foi um dia produtivo. Concluí várias tarefas e tive um tempo de qualidade com a família...' },
  { id: 'j2', date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), mood: 'Reflexivo', preview: 'Pensei muito sobre os próximos passos na carreira. Sinto que preciso de mais clareza...' },
];

export const mockLinks: LinkItem[] = [
  { id: 'l1', name: 'Gmail', url: 'https://mail.google.com', folder_id: null, sort_order: 0 },
  { id: 'l2', name: 'Google Drive', url: 'https://drive.google.com', folder_id: null, sort_order: 1 },
  { id: 'l3', name: 'YouTube Studio', url: 'https://studio.youtube.com', folder_id: null, sort_order: 2 },
  { id: 'l4', name: 'Notion', url: 'https://notion.so', folder_id: null, sort_order: 3 },
  { id: 'l5', name: 'Calendário', url: 'https://calendar.google.com', folder_id: null, sort_order: 4 },
];

export const mockGratitude: GratitudeItem[] = [
  { id: 'gr1', text: 'Pela saúde e energia de hoje.' },
  { id: 'gr2', text: 'Pelo tempo de qualidade com a família.' },
  { id: 'gr3', text: 'Por uma conversa que me trouxe clareza.' },
];
