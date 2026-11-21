process.env.EXPO_PUBLIC_API_URL = 'https://curso.test';
const { createTask, fetchTasks, removeTask, setTaskCompleted, updateTask }: typeof import('../src/services/taskService') = require('../src/services/taskService');

const originalFetch = globalThis.fetch;
const mockFetch = jest.fn();
const response = (body: unknown, status = 200) => ({ ok: status < 400, status, json: async () => body });
const remote = { id: 8, title: 'Informe', description: null, completed: false };

beforeEach(() => { globalThis.fetch = mockFetch; mockFetch.mockReset(); });
afterAll(() => { globalThis.fetch = originalFetch; });

it('pagina el listado público y convierte el id y la descripción', async () => {
  mockFetch.mockResolvedValueOnce(response(Array.from({ length: 100 }, (_, i) => ({ ...remote, id: i + 1 }))))
    .mockResolvedValueOnce(response([{ ...remote, id: 101 }]));
  const tasks = await fetchTasks();
  expect(tasks).toHaveLength(101);
  expect(tasks[100]).toMatchObject({ id: '101', description: '', priority: 'sin' });
  expect(mockFetch).toHaveBeenLastCalledWith('https://curso.test/tasks/?skip=100&limit=100', expect.objectContaining({ headers: { Accept: 'application/json' } }));
});

it('crea con los campos del contrato sin prioridad ni credenciales', async () => {
  mockFetch.mockResolvedValue(response(remote, 201));
  await createTask({ title: 'Informe', description: null });
  const [, request] = mockFetch.mock.calls[0];
  expect(request.method).toBe('POST');
  expect(JSON.parse(request.body)).toEqual({ title: 'Informe', description: null, completed: false });
  expect(request.headers.Authorization).toBeUndefined();
});

it('cambia el estado con PUT y conserva la descripción actual del servidor', async () => {
  mockFetch.mockResolvedValueOnce(response(remote)).mockResolvedValueOnce(response({ ...remote, completed: true }));
  await expect(setTaskCompleted('8', true)).resolves.toMatchObject({ completed: true });
  const [url, request] = mockFetch.mock.calls[1];
  expect(url).toBe('https://curso.test/tasks/8');
  expect(request.method).toBe('PUT');
  expect(JSON.parse(request.body)).toEqual({ title: 'Informe', description: null, completed: true });
});

it('editar un título respeta el estado y la descripción de otra persona', async () => {
  mockFetch.mockResolvedValueOnce(response({ ...remote, description: 'Compartida', completed: true }))
    .mockResolvedValueOnce(response({ ...remote, title: 'Editado', description: 'Compartida', completed: true }));
  await updateTask('8', { title: 'Editado' });
  expect(JSON.parse(mockFetch.mock.calls[1][1].body)).toEqual({ title: 'Editado', description: 'Compartida', completed: true });
});

it('admite DELETE con respuesta vacía y conserva el detalle de los errores', async () => {
  mockFetch.mockResolvedValueOnce(response(null, 204));
  await expect(removeTask('8')).resolves.toBeUndefined();
  mockFetch.mockResolvedValueOnce(response({ detail: 'Tarea inexistente' }, 404));
  await expect(removeTask('8')).rejects.toMatchObject({ status: 404, message: 'Tarea inexistente' });
});
