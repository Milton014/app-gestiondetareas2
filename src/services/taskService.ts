import { apiRequest } from './api';
import type { Task } from '../types/task';

type RemoteTask = { id: number; title: string; description: string | null; completed: boolean };
type Content = Pick<RemoteTask, 'title' | 'description'>;

function toTask(data: RemoteTask): Task {
  return { id: String(data.id), title: data.title, description: data.description ?? '', completed: data.completed, priority: 'sin' };
}

export async function fetchTasks(): Promise<Task[]> {
  const tasks: Task[] = [];
  const limit = 100;
  for (let skip = 0; ; skip += limit) {
    const page = await apiRequest<RemoteTask[]>(`/tasks/?skip=${skip}&limit=${limit}`);
    tasks.push(...page.map(toTask));
    if (page.length < limit) return tasks;
  }
}

export async function createTask(content: Content): Promise<Task> {
  const data = await apiRequest<RemoteTask>('/tasks/', {
    method: 'POST',
    body: { title: content.title, description: content.description, completed: false },
  });
  return toTask(data);
}

// La API acepta PUT con título, descripción y estado. Se releen los campos
// compartidos para conservar los que este dispositivo no está modificando.
async function putTask(id: string, changes: Partial<Content & { completed: boolean }>): Promise<Task> {
  const path = `/tasks/${encodeURIComponent(id)}`;
  const { title, description, completed } = await apiRequest<RemoteTask>(path);
  const data = await apiRequest<RemoteTask>(path, {
    method: 'PUT', body: { title, description, completed, ...changes },
  });
  return toTask(data);
}

export function updateTask(id: string, changes: Partial<Content>): Promise<Task> {
  return putTask(id, changes);
}

export function setTaskCompleted(id: string, completed: boolean): Promise<Task> {
  return putTask(id, { completed });
}

export async function removeTask(id: string): Promise<void> {
  await apiRequest<void>(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
