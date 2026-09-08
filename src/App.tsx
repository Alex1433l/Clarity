import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/hooks/useTheme';
import { LanguageProvider } from '@/hooks/useLanguage';
import AppLayout from '@/layouts/AppLayout';
import TodayPage from '@/pages/TodayPage';
import TasksPage from '@/pages/TasksPage';
import HabitsPage from '@/pages/HabitsPage';
import GoalsPage from '@/pages/GoalsPage';
import MoodPage from '@/pages/MoodPage';
import ReportsPage from '@/pages/ReportsPage';
import LinksPage from '@/pages/LinksPage';
import LearningPage from '@/pages/LearningPage';
import SettingsPage from '@/pages/SettingsPage';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<TodayPage />} />
              <Route path="/tarefas" element={<TasksPage />} />
              <Route path="/habitos" element={<HabitsPage />} />
              <Route path="/objetivos" element={<GoalsPage />} />
              <Route path="/meu-estado" element={<MoodPage />} />
              <Route path="/relatorios" element={<ReportsPage />} />
              <Route path="/links" element={<LinksPage />} />
              <Route path="/aprendizado" element={<LearningPage />} />
              <Route path="/configuracoes" element={<SettingsPage />} />
              <Route path="*" element={<TodayPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
