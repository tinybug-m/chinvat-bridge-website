import { StatusTag, sprintTone } from "./StatusTag";

/** Stored statuses are Title Case ("In Progress"); show them in sentence case. */
function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

interface SprintRow {
  key: string;
  title: string;
  detail: string;
  status: string;
  date: string;
}

/**
 * Sprint deliverables. A table from sm up; on phones the date folds under the
 * detail so nothing scrolls sideways.
 */
export function SprintTable({ rows }: { rows: SprintRow[] }) {
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-line text-small text-ink-muted">
          <th scope="col" className="py-3 pr-4 pl-5 font-medium sm:pl-6">
            Deliverable
          </th>
          <th scope="col" className="px-4 py-3 font-medium">
            Status
          </th>
          <th scope="col" className="hidden py-3 pr-6 pl-4 font-medium sm:table-cell">
            Date
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {rows.map((row) => (
          <tr key={row.key} className="align-top">
            <td className="py-4 pr-4 pl-5 sm:pl-6">
              <div className="text-small font-medium text-ink">{row.title}</div>
              <div className="mt-0.5 text-small text-ink-muted">{row.detail}</div>
              <div className="mt-1 text-small text-ink-muted sm:hidden">{row.date}</div>
            </td>
            <td className="px-4 py-4">
              <StatusTag tone={sprintTone(row.status)}>{sentenceCase(row.status)}</StatusTag>
            </td>
            <td className="hidden py-4 pr-6 pl-4 text-small whitespace-nowrap text-ink-muted tabular-nums sm:table-cell">
              {row.date}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
