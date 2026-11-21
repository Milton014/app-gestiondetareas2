// Simula el directorio de documentos del teléfono, que persiste entre lecturas.
const mockDisk = new Map<string, string>();
class MockFile {
  constructor(_directory: string, readonly name: string) {}
  get exists() { return mockDisk.has(this.name); }
  textSync() { return mockDisk.get(this.name); }
  create() { mockDisk.set(this.name, ''); }
  write(text: string) { mockDisk.set(this.name, text); }
  async move(target: MockFile) {
    mockDisk.set(target.name, mockDisk.get(this.name)!);
    mockDisk.delete(this.name);
  }
}
jest.mock('expo-file-system', () => ({
  Paths: { document: '/documentos' },
  get File() { return MockFile; },
}));

import { readPriorities, savePriority } from '../src/services/priorityStore';
import { filterTasks } from '../src/utils/taskFilters';

beforeEach(() => mockDisk.clear());

it('guarda prioridades por id, las vuelve a leer y quita solo la elegida', async () => {
  expect(readPriorities()).toEqual({});
  await savePriority('8', 'alta');
  await savePriority('9', 'baja');
  expect(readPriorities()).toEqual({ '8': 'alta', '9': 'baja' });
  await savePriority('8', 'media');
  await savePriority('9', 'sin');
  expect(readPriorities()).toEqual({ '8': 'media' });
});

it('combina texto, estado y prioridad local', () => {
  const task = { id: '8', title: 'Informe', description: '', priority: 'alta' as const, completed: false };
  expect(filterTasks([task], 'INFO', 'pendientes', 'alta')).toEqual([task]);
  expect(filterTasks([task], 'INFO', 'pendientes', 'sin')).toEqual([]);
});
