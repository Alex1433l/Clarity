import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Language = 'pt' | 'es' | 'en';

const translations = {
  pt: {
    // Nav
    today: 'Hoje', tasks: 'Tarefas', habits: 'Hábitos', mood: 'Meu Estado',
    goals: 'Objetivos', reports: 'Relatórios', spiritual: 'Espiritual',
    journal: 'Diário', links: 'Links', settings: 'Configurações',
    // Today page
    goodMorning: 'Bom dia', goodAfternoon: 'Boa tarde', goodEvening: 'Boa noite',
    todaySubtitle: 'Como você está hoje? Veja o que precisa ser feito e o que está construindo.',
    howAmI: 'Como estou', moodToday: 'Seu estado pessoal hoje', update: 'Atualizar',
    registerMood: 'Registrar como estou me sentindo',
    todayTasks: 'Tarefas do dia', todayHabits: 'Hábitos do dia',
    noTasksToday: 'Nenhuma tarefa para hoje. Adicionar?',
    noHabitsCreated: 'Nenhum hábito criado. Adicionar?',
    addTask: 'Adicionar tarefa', addHabit: 'Adicionar hábito',
    goalsInProgress: 'Objetivos em andamento', seeAll: 'Ver todos',
    prayers: 'Orações', addPrayer: 'Adicionar oração',
    gratitude: 'Gratidão', addGratitude: 'Adicionar gratidão',
    todayJournal: 'Diário de hoje', write: 'Escrever',
    noJournalYet: 'Ainda não há registro para hoje.',
    journalPrompt: 'Que tal escrever algumas linhas sobre o seu dia?',
    // Tasks
    tasksTitle: 'Tarefas', tasksSubtitle: 'Organize o que precisa ser feito',
    newTask: 'Nova tarefa', editTask: 'Editar tarefa',
    all: 'Todas', pending: 'Pendentes', done: 'Concluídas',
    noTasks: 'Nenhuma tarefa aqui', noTasksDone: 'Nenhuma tarefa concluída',
    noTasksDesc: 'Adicione uma nova tarefa para começar a se organizar.',
    createTask: 'Criar tarefa', title: 'Título',
    taskPlaceholder: 'O que precisa ser feito?',
    priority: 'Prioridade', high: 'Alta', medium: 'Média', low: 'Baixa',
    date: 'Data', time: 'Horário', category: 'Categoria',
    categoryPlaceholder: 'Ex: Trabalho',
    save: 'Salvar', cancel: 'Cancelar', create: 'Criar',
    delete: 'Excluir', edit: 'Editar',
    confirmDeleteTask: 'Excluir',
    // Habits
    habitsTitle: 'Hábitos', habitsSubtitle: 'Construa consistência, um dia de cada vez',
    newHabit: 'Novo hábito', editHabit: 'Editar hábito',
    habitName: 'Nome do hábito', habitPlaceholder: 'Ex: Beber 2L de água',
    description: 'Descrição (opcional)', descriptionPlaceholder: 'Por que este hábito é importante?',
    frequency: 'Frequência', daily: 'Diário', weekly: 'Semanal',
    daysOfWeek: 'Dias da semana', color: 'Cor (opcional)',
    noHabits: 'Nenhum hábito ainda', noHabitsDesc: 'Crie seu primeiro hábito para começar a acompanhar sua consistência.',
    createHabit: 'Criar hábito', streak: 'dias seguidos', total: 'total',
    history: 'Histórico', completedToday: 'Concluídos hoje',
    maxStreak: 'Maior sequência', avgCompletion: 'Média de conclusão',
    confirmDeleteHabit: 'Todo o histórico será perdido.',
    thisMonth: 'Neste mês', totalCheckins: 'Total',
    // Mood
    moodTitle: 'Meu Estado', moodSubtitle: 'Acompanhe como você está se sentindo',
    moodDisclaimer: 'Estes registros são para acompanhamento pessoal e autoconhecimento. Não constituem diagnóstico médico.',
    anxiety: 'Ansiedade', energy: 'Energia', moodScale: 'Humor',
    scale1to5: 'Escala de 1 a 5', recentEvolution: 'Evolução recente',
    noMoodRecords: 'Nenhum registro ainda. Salve seu primeiro estado hoje.',
    // Goals
    goalsTitle: 'Objetivos', goalsSubtitle: 'Transforme o que deseja em ações concretas',
    newGoal: 'Novo objetivo', editGoal: 'Editar objetivo',
    goalTitle: 'Título', goalDescription: 'Descrição',
    lifeArea: 'Área da vida', deadline: 'Prazo', progress: 'Progresso',
    noGoals: 'Nenhum objetivo ainda', noGoalsDesc: 'Crie seu primeiro objetivo para começar a transformar desejos em ações.',
    createGoal: 'Criar objetivo', noLifeArea: 'Sem área',
    selectLifeArea: 'Selecione uma área', manageLifeAreas: 'Gerenciar áreas',
    newLifeArea: 'Nova área', lifeAreaName: 'Nome da área',
    confirmDeleteGoal: 'Excluir este objetivo?',
    lifeAreaColor: 'Cor',
    // Reports
    reportsTitle: 'Relatórios', reportsSubtitle: 'Veja sua evolução ao longo do tempo',
    avg30days: 'Média dos últimos 30 dias', last7days: 'Últimos 7 dias',
    records: 'registros', noReportData: 'Sem dados ainda',
    noReportDataDesc: 'Comece registrando seu estado pessoal diariamente. Seus relatórios aparecerão aqui.',
    // Settings
    settingsTitle: 'Configurações', settingsSubtitle: 'Personalize sua experiência',
    appearance: 'Aparência', theme: 'Tema', themeDesc: 'Escolha claro ou escuro',
    light: 'Claro', dark: 'Escuro',
    preferences: 'Preferências', notifications: 'Notificações',
    notificationsDesc: 'Lembretes de tarefas e hábitos',
    language: 'Idioma', languageDesc: 'Escolha o idioma do app',
    backup: 'Backup e sincronização', backupDesc: 'Salve seus dados na nuvem',
    soon: 'Em breve', aboutClarity: 'Sobre o CLARITY',
    version: 'Versão 1.0.0 — primeira etapa',
    aboutDesc: 'CLARITY é um sistema pessoal para organizar, acompanhar e registrar diferentes áreas da vida em um único lugar.',
    // Misc
    organizeLife: 'Organize sua vida', findClarity: 'Encontre clareza',
    findClarityDesc: 'Registre seu estado diariamente para descobrir padrões.',
    search: 'Pesquisar no CLARITY...',
    markToday: 'Marcar hoje', unmark: 'Desmarcar', complete: 'Concluir',
    // Spiritual
    spiritualSubtitle: 'Orações, gratidão e reflexões',
    reflection: 'Reflexão', readings: 'Leituras',
    reflectionPlaceholder: 'Um espaço para seus pensamentos e reflexões.',
    readingsPlaceholder: 'Registre leituras e suas reflexões.',
    // Journal
    journalTitle: 'Diário', journalSubtitle: 'Registre o que aconteceu e como se sentiu',
    newEntry: 'Novo registro', emptyJournal: 'Seu diário está vazio',
    emptyJournalDesc: 'Escreva sobre o seu dia, seus sentimentos e o que aprendeu.',
    writeNow: 'Escrever agora', moodLabel: 'Humor',
    // Links
    linksTitle: 'Links', linksSubtitle: 'Sua central pessoal de atalhos',
    newLink: 'Novo link',
    // Gratitude
    gratitudeTitle: 'Gratidão',
    gratitudePlaceholder: 'Escreva algo pelo qual você é grato hoje...',
    gratitudeEmpty: 'Nenhum agradecimento ainda. Que tal começar agora?',
    gratitudeThisMonth: 'Agradecimentos deste mês',
    confirmDeleteGratitude: 'Excluir este agradecimento?',
    // Journal (in mood page)
    journalSection: 'Diário', journalWriteHere: 'Escreva aqui...',
    journalMoodOptional: 'Humor (opcional)',
    journalEntriesTitle: 'Registros recentes',
    noJournalEntries: 'Nenhum registro ainda.',
    confirmDeleteJournal: 'Excluir este registro?',
    editEntry: 'Editar registro',
    // Learning
    learning: 'Aprendizado', learningSubtitle: 'Seus estudos e anotações em um só lugar',
    newDoc: 'Novo documento', newSubdoc: 'Novo subdocumento',
    deleteDoc: 'Excluir documento', confirmDeleteDoc: 'Excluir este documento e todos os seus subdocumentos?',
    untitledDoc: 'Sem título', emptyDoc: 'Comece a escrever...',
    saved: 'Salvo', saving: 'Salvando...',
    bold: 'Negrito', italic: 'Itálico', underline: 'Sublinhado', uppercase: 'Maiúsculas',
    heading1: 'Título 1', heading2: 'Título 2', heading3: 'Título 3',
    bulletList: 'Lista', numberedList: 'Lista numerada',
    textColor: 'Cor do texto',
    noDocs: 'Nenhum documento ainda', noDocsDesc: 'Crie seu primeiro documento para começar a anotar.',
    // Auth
    login: 'Entrar', signup: 'Criar conta', createAccount: 'Criar conta',
    email: 'E-mail', password: 'Senha', logout: 'Sair',
    authSubtitle: 'Seus dados ficam salvos na sua conta, privados para você.',
  },
  es: {
    today: 'Hoy', tasks: 'Tareas', habits: 'Hábitos', mood: 'Mi Estado',
    goals: 'Objetivos', reports: 'Informes', spiritual: 'Espiritual',
    journal: 'Diario', links: 'Enlaces', settings: 'Configuración',
    goodMorning: 'Buenos días', goodAfternoon: 'Buenas tardes', goodEvening: 'Buenas noches',
    todaySubtitle: '¿Cómo estás hoy? Mira lo que hay que hacer y lo que estás construyendo.',
    howAmI: 'Cómo estoy', moodToday: 'Tu estado personal hoy', update: 'Actualizar',
    registerMood: 'Registrar cómo me siento',
    todayTasks: 'Tareas del día', todayHabits: 'Hábitos del día',
    noTasksToday: 'No hay tareas para hoy. ¿Añadir?',
    noHabitsCreated: 'No hay hábitos creados. ¿Añadir?',
    addTask: 'Añadir tarea', addHabit: 'Añadir hábito',
    goalsInProgress: 'Objetivos en curso', seeAll: 'Ver todo',
    prayers: 'Oraciones', addPrayer: 'Añadir oración',
    gratitude: 'Gratitud', addGratitude: 'Añadir gratitud',
    todayJournal: 'Diario de hoy', write: 'Escribir',
    noJournalYet: 'Aún no hay registro para hoy.',
    journalPrompt: '¿Qué tal escribir unas líneas sobre tu día?',
    tasksTitle: 'Tareas', tasksSubtitle: 'Organiza lo que hay que hacer',
    newTask: 'Nueva tarea', editTask: 'Editar tarea',
    all: 'Todas', pending: 'Pendientes', done: 'Completadas',
    noTasks: 'No hay tareas aquí', noTasksDone: 'No hay tareas completadas',
    noTasksDesc: 'Añade una nueva tarea para empezar a organizarte.',
    createTask: 'Crear tarea', title: 'Título',
    taskPlaceholder: '¿Qué hay que hacer?',
    priority: 'Prioridad', high: 'Alta', medium: 'Media', low: 'Baja',
    date: 'Fecha', time: 'Hora', category: 'Categoría',
    categoryPlaceholder: 'Ej: Trabajo',
    save: 'Guardar', cancel: 'Cancelar', create: 'Crear',
    delete: 'Eliminar', edit: 'Editar', confirmDeleteTask: 'Eliminar',
    habitsTitle: 'Hábitos', habitsSubtitle: 'Construye consistencia, un día a la vez',
    newHabit: 'Nuevo hábito', editHabit: 'Editar hábito',
    habitName: 'Nombre del hábito', habitPlaceholder: 'Ej: Beber 2L de agua',
    description: 'Descripción (opcional)', descriptionPlaceholder: '¿Por qué es importante este hábito?',
    frequency: 'Frecuencia', daily: 'Diario', weekly: 'Semanal',
    daysOfWeek: 'Días de la semana', color: 'Color (opcional)',
    noHabits: 'Aún no hay hábitos', noHabitsDesc: 'Crea tu primer hábito para empezar a seguir tu consistencia.',
    createHabit: 'Crear hábito', streak: 'días seguidos', total: 'total',
    history: 'Historial', completedToday: 'Completados hoy',
    maxStreak: 'Mayor racha', avgCompletion: 'Promedio de conclusión',
    confirmDeleteHabit: 'Todo el historial se perderá.',
    thisMonth: 'Este mes', totalCheckins: 'Total',
    moodTitle: 'Mi Estado', moodSubtitle: 'Sigue cómo te sientes',
    moodDisclaimer: 'Estos registros son para seguimiento personal y autoconocimiento. No constituyen diagnóstico médico.',
    anxiety: 'Ansiedad', energy: 'Energía', moodScale: 'Humor',
    scale1to5: 'Escala de 1 a 5', recentEvolution: 'Evolución reciente',
    noMoodRecords: 'Aún no hay registros. Guarda tu primer estado hoy.',
    goalsTitle: 'Objetivos', goalsSubtitle: 'Transforma lo que deseas en acciones concretas',
    newGoal: 'Nuevo objetivo', editGoal: 'Editar objetivo',
    goalTitle: 'Título', goalDescription: 'Descripción',
    lifeArea: 'Área de vida', deadline: 'Plazo', progress: 'Progreso',
    noGoals: 'Aún no hay objetivos', noGoalsDesc: 'Crea tu primer objetivo para empezar a transformar deseos en acciones.',
    createGoal: 'Crear objetivo', noLifeArea: 'Sin área',
    selectLifeArea: 'Selecciona un área', manageLifeAreas: 'Gestionar áreas',
    newLifeArea: 'Nueva área', lifeAreaName: 'Nombre del área',
    confirmDeleteGoal: '¿Eliminar este objetivo?',
    lifeAreaColor: 'Color',
    reportsTitle: 'Informes', reportsSubtitle: 'Mira tu evolución a lo largo del tiempo',
    avg30days: 'Promedio últimos 30 días', last7days: 'Últimos 7 días',
    records: 'registros', noReportData: 'Sin datos aún',
    noReportDataDesc: 'Empieza registrando tu estado personal diariamente. Tus informes aparecerán aquí.',
    settingsTitle: 'Configuración', settingsSubtitle: 'Personaliza tu experiencia',
    appearance: 'Apariencia', theme: 'Tema', themeDesc: 'Elige claro u oscuro',
    light: 'Claro', dark: 'Oscuro',
    preferences: 'Preferencias', notifications: 'Notificaciones',
    notificationsDesc: 'Recordatorios de tareas y hábitos',
    language: 'Idioma', languageDesc: 'Elige el idioma de la app',
    backup: 'Copia de seguridad', backupDesc: 'Guarda tus datos en la nube',
    soon: 'Pronto', aboutClarity: 'Sobre CLARITY',
    version: 'Versión 1.0.0 — primera etapa',
    aboutDesc: 'CLARITY es un sistema personal para organizar, seguir y registrar diferentes áreas de la vida en un solo lugar.',
    organizeLife: 'Organiza tu vida', findClarity: 'Encuentra claridad',
    findClarityDesc: 'Registra tu estado diariamente para descubrir patrones.',
    search: 'Buscar en CLARITY...',
    markToday: 'Marcar hoy', unmark: 'Desmarcar', complete: 'Completar',
    // Spiritual
    spiritualSubtitle: 'Oraciones, gratitud y reflexiones',
    reflection: 'Reflexión', readings: 'Lecturas',
    reflectionPlaceholder: 'Un espacio para tus pensamientos y reflexiones.',
    readingsPlaceholder: 'Registra lecturas y tus reflexiones.',
    // Journal
    journalTitle: 'Diario', journalSubtitle: 'Registra lo que pasó y cómo te sentiste',
    newEntry: 'Nuevo registro', emptyJournal: 'Tu diario está vacío',
    emptyJournalDesc: 'Escribe sobre tu día, tus sentimientos y lo que aprendiste.',
    writeNow: 'Escribir ahora', moodLabel: 'Humor',
    // Links
    linksTitle: 'Enlaces', linksSubtitle: 'Tu central personal de accesos directos',
    newLink: 'Nuevo enlace',
    // Gratitude
    gratitudeTitle: 'Gratitud',
    gratitudePlaceholder: 'Escribe algo por lo que estás agradecido hoy...',
    gratitudeEmpty: 'Aún no hay agradecimientos. ¿Qué tal empezar ahora?',
    gratitudeThisMonth: 'Agradecimientos de este mes',
    confirmDeleteGratitude: '¿Eliminar este agradecimiento?',
    // Journal (in mood page)
    journalSection: 'Diario', journalWriteHere: 'Escribe aquí...',
    journalMoodOptional: 'Humor (opcional)',
    journalEntriesTitle: 'Registros recientes',
    noJournalEntries: 'Aún no hay registros.',
    confirmDeleteJournal: '¿Eliminar este registro?',
    editEntry: 'Editar registro',
    // Learning
    learning: 'Aprendizaje', learningSubtitle: 'Tus estudios y notas en un solo lugar',
    newDoc: 'Nuevo documento', newSubdoc: 'Nuevo subdocumento',
    deleteDoc: 'Eliminar documento', confirmDeleteDoc: '¿Eliminar este documento y todos sus subdocumentos?',
    untitledDoc: 'Sin título', emptyDoc: 'Empieza a escribir...',
    saved: 'Guardado', saving: 'Guardando...',
    bold: 'Negrita', italic: 'Cursiva', underline: 'Subrayado', uppercase: 'Mayúsculas',
    heading1: 'Título 1', heading2: 'Título 2', heading3: 'Título 3',
    bulletList: 'Lista', numberedList: 'Lista numerada',
    textColor: 'Color del texto',
    noDocs: 'Sin documentos aún', noDocsDesc: 'Crea tu primer documento para empezar a anotar.',
    // Auth
    login: 'Entrar', signup: 'Crear cuenta', createAccount: 'Crear cuenta',
    email: 'Correo electrónico', password: 'Contraseña', logout: 'Salir',
    authSubtitle: 'Tus datos se guardan en tu cuenta, privados para ti.',
  },
  en: {
    today: 'Today', tasks: 'Tasks', habits: 'Habits', mood: 'My State',
    goals: 'Goals', reports: 'Reports', spiritual: 'Spiritual',
    journal: 'Journal', links: 'Links', settings: 'Settings',
    goodMorning: 'Good morning', goodAfternoon: 'Good afternoon', goodEvening: 'Good evening',
    todaySubtitle: 'How are you today? See what needs to be done and what you are building.',
    howAmI: 'How am I', moodToday: 'Your personal state today', update: 'Update',
    registerMood: 'Register how I am feeling',
    todayTasks: 'Today\'s tasks', todayHabits: 'Today\'s habits',
    noTasksToday: 'No tasks for today. Add one?',
    noHabitsCreated: 'No habits created. Add one?',
    addTask: 'Add task', addHabit: 'Add habit',
    goalsInProgress: 'Goals in progress', seeAll: 'See all',
    prayers: 'Prayers', addPrayer: 'Add prayer',
    gratitude: 'Gratitude', addGratitude: 'Add gratitude',
    todayJournal: 'Today\'s journal', write: 'Write',
    noJournalYet: 'No entry for today yet.',
    journalPrompt: 'How about writing a few lines about your day?',
    tasksTitle: 'Tasks', tasksSubtitle: 'Organize what needs to be done',
    newTask: 'New task', editTask: 'Edit task',
    all: 'All', pending: 'Pending', done: 'Done',
    noTasks: 'No tasks here', noTasksDone: 'No completed tasks',
    noTasksDesc: 'Add a new task to start getting organized.',
    createTask: 'Create task', title: 'Title',
    taskPlaceholder: 'What needs to be done?',
    priority: 'Priority', high: 'High', medium: 'Medium', low: 'Low',
    date: 'Date', time: 'Time', category: 'Category',
    categoryPlaceholder: 'Ex: Work',
    save: 'Save', cancel: 'Cancel', create: 'Create',
    delete: 'Delete', edit: 'Edit', confirmDeleteTask: 'Delete',
    habitsTitle: 'Habits', habitsSubtitle: 'Build consistency, one day at a time',
    newHabit: 'New habit', editHabit: 'Edit habit',
    habitName: 'Habit name', habitPlaceholder: 'Ex: Drink 2L of water',
    description: 'Description (optional)', descriptionPlaceholder: 'Why is this habit important?',
    frequency: 'Frequency', daily: 'Daily', weekly: 'Weekly',
    daysOfWeek: 'Days of the week', color: 'Color (optional)',
    noHabits: 'No habits yet', noHabitsDesc: 'Create your first habit to start tracking your consistency.',
    createHabit: 'Create habit', streak: 'days in a row', total: 'total',
    history: 'History', completedToday: 'Completed today',
    maxStreak: 'Longest streak', avgCompletion: 'Completion rate',
    confirmDeleteHabit: 'All history will be lost.',
    thisMonth: 'This month', totalCheckins: 'Total',
    moodTitle: 'My State', moodSubtitle: 'Track how you are feeling',
    moodDisclaimer: 'These records are for personal tracking and self-awareness. They do not constitute medical diagnosis.',
    anxiety: 'Anxiety', energy: 'Energy', moodScale: 'Mood',
    scale1to5: 'Scale from 1 to 5', recentEvolution: 'Recent evolution',
    noMoodRecords: 'No records yet. Save your first state today.',
    goalsTitle: 'Goals', goalsSubtitle: 'Turn what you want into concrete actions',
    newGoal: 'New goal', editGoal: 'Edit goal',
    goalTitle: 'Title', goalDescription: 'Description',
    lifeArea: 'Life area', deadline: 'Deadline', progress: 'Progress',
    noGoals: 'No goals yet', noGoalsDesc: 'Create your first goal to start turning wishes into actions.',
    createGoal: 'Create goal', noLifeArea: 'No area',
    selectLifeArea: 'Select an area', manageLifeAreas: 'Manage areas',
    newLifeArea: 'New area', lifeAreaName: 'Area name',
    confirmDeleteGoal: 'Delete this goal?',
    lifeAreaColor: 'Color',
    reportsTitle: 'Reports', reportsSubtitle: 'See your evolution over time',
    avg30days: '30-day average', last7days: 'Last 7 days',
    records: 'records', noReportData: 'No data yet',
    noReportDataDesc: 'Start recording your personal state daily. Your reports will appear here.',
    settingsTitle: 'Settings', settingsSubtitle: 'Customize your experience',
    appearance: 'Appearance', theme: 'Theme', themeDesc: 'Choose light or dark',
    light: 'Light', dark: 'Dark',
    preferences: 'Preferences', notifications: 'Notifications',
    notificationsDesc: 'Task and habit reminders',
    language: 'Language', languageDesc: 'Choose the app language',
    backup: 'Backup & sync', backupDesc: 'Save your data to the cloud',
    soon: 'Soon', aboutClarity: 'About CLARITY',
    version: 'Version 1.0.0 — first stage',
    aboutDesc: 'CLARITY is a personal system to organize, track, and record different areas of life in one place.',
    organizeLife: 'Organize your life', findClarity: 'Find clarity',
    findClarityDesc: 'Record your state daily to discover patterns.',
    search: 'Search in CLARITY...',
    markToday: 'Mark today', unmark: 'Unmark', complete: 'Complete',
    // Spiritual
    spiritualSubtitle: 'Prayers, gratitude and reflections',
    reflection: 'Reflection', readings: 'Readings',
    reflectionPlaceholder: 'A space for your thoughts and reflections.',
    readingsPlaceholder: 'Record readings and your reflections.',
    // Journal
    journalTitle: 'Journal', journalSubtitle: 'Record what happened and how you felt',
    newEntry: 'New entry', emptyJournal: 'Your journal is empty',
    emptyJournalDesc: 'Write about your day, your feelings and what you learned.',
    writeNow: 'Write now', moodLabel: 'Mood',
    // Links
    linksTitle: 'Links', linksSubtitle: 'Your personal shortcut hub',
    newLink: 'New link',
    // Gratitude
    gratitudeTitle: 'Gratitude',
    gratitudePlaceholder: 'Write something you are grateful for today...',
    gratitudeEmpty: 'No gratitude entries yet. How about starting now?',
    gratitudeThisMonth: 'Gratitude this month',
    confirmDeleteGratitude: 'Delete this gratitude entry?',
    // Journal (in mood page)
    journalSection: 'Journal', journalWriteHere: 'Write here...',
    journalMoodOptional: 'Mood (optional)',
    journalEntriesTitle: 'Recent entries',
    noJournalEntries: 'No entries yet.',
    confirmDeleteJournal: 'Delete this entry?',
    editEntry: 'Edit entry',
    // Learning
    learning: 'Learning', learningSubtitle: 'Your studies and notes in one place',
    newDoc: 'New document', newSubdoc: 'New subdocument',
    deleteDoc: 'Delete document', confirmDeleteDoc: 'Delete this document and all its subdocuments?',
    untitledDoc: 'Untitled', emptyDoc: 'Start writing...',
    saved: 'Saved', saving: 'Saving...',
    bold: 'Bold', italic: 'Italic', underline: 'Underline', uppercase: 'Uppercase',
    heading1: 'Heading 1', heading2: 'Heading 2', heading3: 'Heading 3',
    bulletList: 'Bullet list', numberedList: 'Numbered list',
    textColor: 'Text color',
    noDocs: 'No documents yet', noDocsDesc: 'Create your first document to start taking notes.',
    // Auth
    login: 'Sign in', signup: 'Sign up', createAccount: 'Create account',
    email: 'Email', password: 'Password', logout: 'Sign out',
    authSubtitle: 'Your data is saved to your account, private to you.',
  },
} as const;

export type TranslationKey = keyof typeof translations.pt;

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem('clarity-lang') as Language | null;
    return stored ?? 'pt';
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('clarity-lang', l);
  };

  const t = (key: TranslationKey) => translations[lang][key] ?? translations.pt[key] ?? key;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export function getGreeting(lang: Language): string {
  const h = new Date().getHours();
  const t = translations[lang];
  if (h < 12) return t.goodMorning;
  if (h < 18) return t.goodAfternoon;
  return t.goodEvening;
}

export function formatDateByLang(date: Date, lang: Language): string {
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function formatDateShortByLang(dateStr: string, lang: Language): string {
  const locale = lang === 'pt' ? 'pt-BR' : lang === 'es' ? 'es-ES' : 'en-US';
  const d = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
  }).format(d);
}

export function getWeekDays(lang: Language): string[] {
  if (lang === 'pt') return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  if (lang === 'es') return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
}

export function getMonthNames(lang: Language): string[] {
  if (lang === 'pt') return ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  if (lang === 'es') return ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junho', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
}
