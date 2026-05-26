import { FC, useState } from 'react';
import { ActionButton, GhostButton } from '@bka-stuff/pe-mfe-utils';
import { HomeTask, HomeTaskFrequency } from '../../types/homeMaintenance';
import { FREQUENCY_LABELS, formatDate, getDaysUntilDue } from '../../utils/taskUtils';
import { useUpdateHomeTask } from '../../gql/hooks/homeTaskHooks';
import InlineField from '../InlineField';

type Props = {
  task: HomeTask;
  onLog: (task: { id: string; homeId: string; name: string }) => void;
  onDelete: (data: any) => void;
};

function getDueInfo(task: HomeTask): { label: string; cls: string } {
  const days = getDaysUntilDue(task);
  if (task.frequency === HomeTaskFrequency.AS_NEEDED)
    return { label: 'As needed', cls: 'tw:text-muted' };
  if (!task.lastCompletionDate) return { label: 'Never done', cls: 'tw:text-red' };
  if (days !== null && days < 0) return { label: `${Math.abs(days)}d overdue`, cls: 'tw:text-red' };
  if (days !== null && days <= 7) return { label: `Due in ${days}d`, cls: 'tw:text-blue' };
  return { label: `Due in ${days}d`, cls: 'tw:text-muted' };
}

const TaskRow: FC<Props> = ({ task, onLog, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const { mutate: updateTask } = useUpdateHomeTask();

  const { label: dueLabel, cls: dueClass } = getDueInfo(task);

  return (
    <div className="tw:border-b tw:border-purpleFaint tw:last:border-b-0">
      <div className="tw:flex tw:items-center tw:gap-3 tw:px-5 tw:py-3">
        <ActionButton
          iconClass={expanded ? 'fas fa-caret-down' : 'fas fa-caret-right'}
          color="blue"
          onClick={() => setExpanded(!expanded)}
        />
        <span className="tw:flex-1 tw:min-w-0 tw:truncate tw:text-sm">{task.name}</span>
        <span className="tw:text-xs tw:text-muted tw:shrink-0">
          {FREQUENCY_LABELS[task.frequency]}
        </span>
        <span className={`tw:text-xs tw:font-medium tw:shrink-0 ${dueClass}`}>{dueLabel}</span>
        {task.lastCompletionDate && (
          <span className="tw:text-xs tw:text-muted tw:shrink-0">
            Last: {formatDate(task.lastCompletionDate)}
          </span>
        )}
        <div className="tw:flex tw:items-center tw:gap-2 tw:shrink-0">
          <GhostButton
            text="Log"
            color="blue"
            size="sm"
            onClick={() => onLog({ id: task.id, homeId: task.homeId, name: task.name })}
            last
          />
          <GhostButton
            text="Delete"
            color="red"
            size="sm"
            onClick={() => onDelete({ id: task.id, name: task.name })}
            last
          />
        </div>
      </div>

      {expanded && (
        <div className="tw:px-5 tw:pb-4 tw:pt-1 tw:border-t tw:border-purpleFaint">
          <InlineField
            label="Name"
            value={task.name}
            onSave={(v) => updateTask({ id: task.id, homeId: task.homeId, name: v })}
          />
          <div className="tw:flex tw:items-center tw:gap-3 tw:py-1.5">
            <span className="tw:text-sm tw:text-muted tw:w-28 tw:shrink-0">Frequency</span>
            <select
              value={task.frequency}
              onChange={(e) =>
                updateTask({
                  id: task.id,
                  homeId: task.homeId,
                  frequency: e.target.value as HomeTaskFrequency,
                })
              }
              className="tw:border tw:border-purple tw:rounded tw:text-sm tw:px-2 tw:py-1 tw:bg-bg"
            >
              {Object.values(HomeTaskFrequency).map((f) => (
                <option key={f} value={f}>
                  {FREQUENCY_LABELS[f]}
                </option>
              ))}
            </select>
          </div>
          <InlineField
            label="Description"
            value={task.description}
            onSave={(v) => updateTask({ id: task.id, homeId: task.homeId, description: v })}
            placeholder="None"
          />
          <div className="tw:flex tw:justify-end tw:pt-2">
            <GhostButton
              text="Log"
              color="green"
              size="sm"
              onClick={() => onLog({ id: task.id, homeId: task.homeId, name: task.name })}
              last
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskRow;
