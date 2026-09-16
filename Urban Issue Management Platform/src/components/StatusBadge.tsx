import type { Status } from '../data';
import { STATUS_LABEL } from '../data';

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`s-${status} font-mono-data text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
