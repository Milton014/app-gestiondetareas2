export type TaskPriority = 'alta' | 'media' | 'baja' | 'sin';
export type TaskStatus = 'todas' | 'pendientes' | 'completadas';

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  completed: boolean;
};

export const priorityLabels: Record<TaskPriority, string> = {
  sin: 'Sin prioridad',
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
};
