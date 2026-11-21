import { fireEvent, render, waitFor, act } from '@testing-library/react-native';
import { savePriority } from '../src/services/priorityStore';
import TaskManagerScreen from '../app/index';
import * as service from '../src/services/taskService';
import type { Task } from '../src/types/task';

// La carga inicial de los componentes nativos puede ser lenta en Windows.
jest.setTimeout(45000);

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../src/services/priorityStore', () => ({
  readPriorities: () => ({}),
  savePriority: jest.fn(),
}));
jest.mock('../src/services/taskService', () => ({ fetchTasks: jest.fn(), createTask: jest.fn(), updateTask: jest.fn(), setTaskCompleted: jest.fn(), removeTask: jest.fn() }));

const initial: Task = { id: '1', title: 'Estudiar', description: 'Una tarea', priority: 'media', completed: false };
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(service.fetchTasks).mockResolvedValue([{ ...initial }]);
});

it('espera al servidor y evita altas duplicadas mientras guarda', async () => {
  let resolve!: (task: Task) => void;
  jest.mocked(service.createTask).mockReturnValue(new Promise<Task>((done) => { resolve = done; }));
  const view = render(<TaskManagerScreen />);
  await view.findByTestId('toggle-1');
  fireEvent.changeText(view.getByTestId('new-task-input'), 'Nueva');
  fireEvent.press(view.getByTestId('add-task-button'));
  fireEvent.press(view.getByTestId('add-task-button'));
  expect(service.createTask).toHaveBeenCalledTimes(1);
  expect(view.queryByTestId('toggle-2')).toBeNull();
  await act(async () => { resolve({ ...initial, id: '2', title: 'Nueva' }); });
  expect(view.getByTestId('toggle-2')).toBeTruthy();
});

it('conserva el formulario cuando falla el guardado', async () => {
  jest.mocked(service.createTask).mockRejectedValue(new Error('Servidor desconectado'));
  const view = render(<TaskManagerScreen />);
  await view.findByTestId('toggle-1');
  fireEvent.changeText(view.getByTestId('new-task-input'), 'No perder');
  fireEvent.press(view.getByTestId('add-task-button'));
  await view.findByText('Servidor desconectado');
  expect(view.getByTestId('new-task-input').props.value).toBe('No perder');
  expect(view.getByTestId('add-task-button').props.accessibilityState.disabled).toBe(false);
});

it('actualiza el estado usando la tarea confirmada por el servidor', async () => {
  jest.mocked(service.setTaskCompleted).mockResolvedValue({ ...initial, completed: true });
  const view = render(<TaskManagerScreen />);
  fireEvent.press(await view.findByTestId('toggle-1'));
  await view.findByText('Completada');
  expect(service.setTaskCompleted).toHaveBeenCalledWith('1', true);
});

it('permite asignar prioridad sin editar la tarea compartida', async () => {
  const view = render(<TaskManagerScreen />);
  fireEvent.press(await view.findByTestId('expand-1'));
  fireEvent.press(view.getByText('Editar tarea'));
  fireEvent.press(view.getAllByText('Alta')[0]);
  fireEvent.press(view.getByText('Guardar cambios'));
  await waitFor(() => expect(savePriority).toHaveBeenCalledWith('1', 'alta'));
  expect(await view.findByText('ALTA')).toBeTruthy();
  expect(service.updateTask).not.toHaveBeenCalled();
});

it('muestra el alta remota aunque falle el guardado local de la prioridad', async () => {
  jest.mocked(savePriority).mockRejectedValueOnce(new Error('Disco lleno'));
  jest.mocked(service.createTask).mockResolvedValue({ ...initial, id: '2', title: 'Nueva' });
  const view = render(<TaskManagerScreen />);
  await view.findByTestId('toggle-1');
  fireEvent.changeText(view.getByTestId('new-task-input'), 'Nueva');
  fireEvent.press(view.getAllByText('Alta')[0]);
  fireEvent.press(view.getByTestId('add-task-button'));
  await view.findByTestId('toggle-2');
  expect(view.getByText(/No se pudo guardar la prioridad/)).toBeTruthy();
  expect(view.getByTestId('new-task-input').props.value).toBe('');
  expect(service.createTask).toHaveBeenCalledTimes(1);
});
