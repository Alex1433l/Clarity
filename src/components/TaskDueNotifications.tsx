import { useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useNotifications } from '@/hooks/useNotifications';

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export default function TaskDueNotifications() {
  const { tasks } = useTasks();
  const { notify } = useNotifications();

  useEffect(() => {
    const today = localDate();
    const storageKey = `clarity-notified-tasks-${today}`;
    const notifiedIds = new Set(JSON.parse(localStorage.getItem(storageKey) ?? '[]') as string[]);
    const dueTasks = tasks.filter((task) => task.date === today && !task.done && !notifiedIds.has(task.id));

    if (dueTasks.length === 0) return;

    dueTasks.forEach((task) => {
      notify('Tarefa para hoje', task.title);
      notifiedIds.add(task.id);
    });
    localStorage.setItem(storageKey, JSON.stringify([...notifiedIds]));
  }, [tasks, notify]);

  return null;
}
