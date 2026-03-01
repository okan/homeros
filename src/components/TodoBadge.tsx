import { useTodoStore } from '../store/useTodoStore';
import { getUrgencyCounts } from '../utils/deadline';

export const TodoBadge = () => {
  const todos = useTodoStore((state) => state.todos);
  const counts = getUrgencyCounts(todos);

  return (
    <>
      {counts.yellow > 0 && (
        <span className="inline-flex items-center justify-center rounded-full min-w-[18px] h-[18px] px-[6px] text-[11px] font-bold bg-yellow-500 text-white">
          {counts.yellow}
        </span>
      )}
      {counts.red > 0 && (
        <span className="inline-flex items-center justify-center rounded-full min-w-[18px] h-[18px] px-[6px] text-[11px] font-bold bg-red-500 text-white">
          {counts.red}
        </span>
      )}
    </>
  );
};
