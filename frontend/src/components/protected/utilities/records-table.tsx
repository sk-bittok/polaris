import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Eye, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type React from "react";

export interface ColumnTable<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: string;
}

type Props<T> = {
  caption: string;
  columns: ColumnTable<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  className?: string;
};

export interface ActionButtonProps<T> {
  record: T;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onView?: (record: T) => void;
  showEdit?: boolean;
  showView?: boolean;
  showDelete?: boolean;
  className?: string;
}

const ActionButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  className: string;
}> = ({ onClick, children, className }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 text-white text-sm rounded-xs hover:opacity-80 ${className}`}
  >
    {children}
  </button>
);

export function ActionButtons<T>({
  record,
  onEdit,
  onDelete,
  onView,
  showView = true,
  showEdit = true,
  showDelete = true,
  className = "flex items-center justify-start gap-2",
}: ActionButtonProps<T>) {
  return (
    <div className={className}>
      {/* Edit button */}
      {showEdit && onEdit && (
        <ActionButton
          onClick={() => onEdit(record)}
          className="bg-green-500 dark:bg-green-600"
        >
          <Pencil size={16} className="w-4 h-4" />
        </ActionButton>
      )}
      {/* View */}
      {showView && onView && (
        <ActionButton
          onClick={() => onView(record)}
          className="bg-blue-500 dark:bg-blue-600"
        >
          <Eye size={16} className="w-4 h-4" />
        </ActionButton>
      )}
      {/* Delete */}
      {showDelete && onDelete && (
        <ActionButton
          onClick={() => onDelete(record)}
          className="bg-red-500 dark:bg-red-600"
        >
          <Trash2 size={16} className="w-4 h-4" />
        </ActionButton>
      )}
    </div>
  );
}

export default function RecordsTable<T>({
  caption,
  columns,
  data,
  keyExtractor,
  emptyMessage = "No data available",
  className,
}: Props<T>) {
  return (
    <Table className={className}>
      <TableCaption>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          {columns.map((column) =>
            column.sortable === true && column.onSort !== undefined ? (
              <TableHead
                key={column.key}
                className={`${column.className} cursor-pointer`}
                onClick={() => column?.onSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {column.sortField === column.key &&
                  column.sortDirection === "asc" ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </div>
              </TableHead>
            ) : (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ),
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="text-center py-8 text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={keyExtractor(item)}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render
                    ? column.render(item)
                    : String(item[column.key as keyof T])}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
