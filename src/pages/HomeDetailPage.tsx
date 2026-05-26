import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetHome } from '../gql/hooks/homeHooks';
import { useDeleteHomeTask, useGetHomeTasks } from '../gql/hooks/homeTaskHooks';
import { sortTasksByUrgency } from '../utils/taskUtils';
import AddTaskModal from '../components/home/modals/AddTaskModal';
import LogCompletionModalNew from '../components/home/modals/LogCompletionModal';
import TaskRow from '../components/home/TaskRow';
import { Button, TransparentButton, DeleteConfirmationModal } from '@bka-stuff/pe-mfe-utils';
import HomeDetails from '../components/home/HomeDetails';

export default function HomeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: home, isPending: homePending, isError: homeError } = useGetHome(id!);
  const { data: tasks } = useGetHomeTasks(id);
  const sortedTasks = tasks ? sortTasksByUrgency(tasks) : [];
  const { mutate: deleteTask } = useDeleteHomeTask(id as string);

  const [showAddTask, setShowAddTask] = useState(false);
  const [logTaskId, setLogTaskId] = useState<{ id: string; homeId: string; name: string } | null>(
    null,
  );
  const [confirmDeleteTask, setConfirmDeleteTask] = useState<{ id: string; name: string } | null>(
    null,
  );

  if (homePending) return <div className="tw:p-6 tw:text-muted">Loading...</div>;
  if (homeError || !home) return <div className="tw:p-6 tw:text-red">Home not found.</div>;

  function handleDeleteTask() {
    if (confirmDeleteTask?.id) deleteTask(confirmDeleteTask.id);
  }

  return (
    <div className="tw:max-w-3xl tw:mx-auto tw:px-4 tw:py-6">
      <div className="tw:mb-[12px]">
        <TransparentButton text="← Back" size="md" onClick={() => navigate('/home-maintenance')} />
      </div>

      <HomeDetails home={home} />

      <div className="tw:bg-surface tw:rounded-lg tw:border tw:border-purpleBorder">
        <div className="tw:flex tw:items-center tw:justify-between tw:px-5 tw:py-4 tw:border-b tw:border-purpleBorder">
          <h2 className="tw:font-semibold tw:text-primary">Tasks</h2>
          <Button text="+ Add task" color="purple" onClick={() => setShowAddTask(true)} last />
        </div>

        {sortedTasks.length === 0 && (
          <p className="tw:px-5 tw:py-4 tw:text-muted tw:text-sm">No tasks yet.</p>
        )}

        {sortedTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onLog={setLogTaskId}
            onDelete={(data: any) => setConfirmDeleteTask(data)}
          />
        ))}
      </div>

      <AddTaskModal isOpen={showAddTask} homeId={home.id} onClose={() => setShowAddTask(false)} />

      <LogCompletionModalNew
        isOpen={!!logTaskId}
        onClose={() => setLogTaskId(null)}
        logTaskId={logTaskId}
      />

      <DeleteConfirmationModal
        isOpen={!!confirmDeleteTask}
        onClose={() => setConfirmDeleteTask(null)}
        onConfirm={handleDeleteTask}
        name={confirmDeleteTask?.name}
      />
    </div>
  );
}
