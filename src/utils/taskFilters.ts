import type { Task, TaskPriority, TaskStatus } from '../types/task';

export function filterTasks(tasks: Task[], query: string, status: TaskStatus, priority: TaskPriority | 'todas' = 'todas'): Task[] {
  const search = query.trim().toLocaleLowerCase();
  return tasks.filter((task) => {
    const matchesStatus = status === 'todas' || (status === 'pendientes' ? !task.completed : task.completed);
    const matchesPriority = priority === 'todas' || task.priority === priority;
    return matchesStatus && matchesPriority && task.title.toLocaleLowerCase().includes(search);
  });
}
