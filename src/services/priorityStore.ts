import { File, Paths } from 'expo-file-system';
import { API_URL } from './api';
import type { TaskPriority } from '../types/task';

type Priorities = Record<string, TaskPriority>;
const namespace = API_URL.replace(/[^a-z0-9.-]/gi, (c) => '_' + c.charCodeAt(0).toString(16));
const fileName = 'prioridades-tareas2-' + namespace + '.json';

export function readPriorities(): Priorities {
  const file = new File(Paths.document, fileName);
  if (!file.exists) return {};
  const data: unknown = JSON.parse(file.textSync());
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('El archivo de prioridades del dispositivo tiene un formato inesperado.');
  }
  const priorities: Priorities = {};
  for (const [id, value] of Object.entries(data)) {
    if (/^\d+$/.test(id) && (value === 'alta' || value === 'media' || value === 'baja')) {
      priorities[id] = value;
    }
  }
  return priorities;
}

export async function savePriority(id: string, value: TaskPriority): Promise<void> {
  const priorities = readPriorities();
  if ((priorities[id] ?? 'sin') === value) return;
  if (value === 'sin') delete priorities[id];
  else priorities[id] = value;
  const temporary = new File(Paths.document, fileName + '.tmp');
  temporary.create({ overwrite: true });
  temporary.write(JSON.stringify(priorities));
  await temporary.move(new File(Paths.document, fileName), { overwrite: true });
}
