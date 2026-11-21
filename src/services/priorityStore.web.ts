import { API_URL } from './api';
import type { TaskPriority } from '../types/task';

const prefix = 'gestor-tareas2:' + API_URL + ':';

export function readPriorities(): Record<string, TaskPriority> {
  const result: Record<string, TaskPriority> = {};
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (!key?.startsWith(prefix)) continue;
    const value = localStorage.getItem(key);
    if (value === 'alta' || value === 'media' || value === 'baja') {
      result[key.slice(prefix.length)] = value;
    }
  }
  return result;
}

export async function savePriority(id: string, value: TaskPriority): Promise<void> {
  if (value === 'sin') localStorage.removeItem(prefix + id);
  else localStorage.setItem(prefix + id, value);
}
