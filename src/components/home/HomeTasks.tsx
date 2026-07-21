import { FC, useState } from 'react';
import { useGetHomeTasks } from '../../gql/hooks/homeTaskHooks';
import { sortTasksByUrgency } from '../../utils/taskUtils';
import { LogCompletionForm } from '../../pages/MainPage';
import LogCompletionModal from './modals/LogCompletionModal';
import TaskRow from './TaskRow';

type Props = {
  activeHomeId: string | undefined;
  homesPending: boolean;
};

const HomeTasks: FC<Props> = ({ activeHomeId, homesPending = false }) => {
  const [logCompletion, setLogCompletion] = useState<LogCompletionForm | null>(null);
  const { data: tasks } = useGetHomeTasks(activeHomeId);
  const sortedTasks = tasks ? sortTasksByUrgency(tasks) : [];

  return (
    <div className="tw:bg-surface tw:rounded-lg tw:border tw:border-purpleBorder">
      <div className="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3 tw:border-b tw:border-purpleBorder">
        <h2 className="tw:font-semibold tw:text-primary">Upcoming Tasks</h2>
      </div>

      {!activeHomeId && !homesPending ? (
        <p className="tw:px-4 tw:py-4 tw:text-muted tw:text-sm">Add a home to get started.</p>
      ) : null}

      {sortedTasks.length === 0 && activeHomeId ? (
        <p className="tw:px-4 tw:py-4 tw:text-muted tw:text-sm">No tasks yet.</p>
      ) : null}

      {sortedTasks.map((task) => (
        <TaskRow key={task.id} task={task} onLog={setLogCompletion} />
      ))}

      <LogCompletionModal
        isOpen={!!logCompletion}
        logTask={logCompletion}
        onClose={() => setLogCompletion(null)}
      />
    </div>
  );
};

export default HomeTasks;
