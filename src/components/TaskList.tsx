import type { Task } from "../types";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  onToggleDone: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskList = ({ tasks, onToggleDone, onEdit, onDelete }: TaskListProps): JSX.Element => {
  if (tasks.length === 0) {
    return (
      <section className="surface-panel animate-fadeIn p-10 text-center">
        <h3 className="font-display text-2xl font-semibold">Пока пусто</h3>
        <p className="mt-2 muted-text">
          Добавь первую задачу через кнопку <strong>+ Add task</strong> и начни новый streak.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-3 pb-8">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onToggleDone={onToggleDone} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </section>
  );
};
