'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { createClient } from '@/lib/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { StageBadge } from './stage-badge';
import { STAGE_CONFIGS } from '@/lib/stages';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Download,
  Archive,
  Loader2,
} from 'lucide-react';
import type { Project, Client } from '@/types/database.types';

type ProjectWithClient = Project & {
  clients: Pick<Client, 'name'> | null;
};

interface ProjectsTableProps {
  initialProjects: ProjectWithClient[];
}

export function ProjectsTable({ initialProjects }: ProjectsTableProps) {
  const [projects, setProjects] = useState<ProjectWithClient[]>(initialProjects);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newId = (payload.new as any).id;
            const { data: newProject } = await supabase
              .from('projects')
              .select('*, clients(name)')
              .eq('id', newId)
              .single();

            if (newProject) {
              setProjects((prev) => [newProject as ProjectWithClient, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updateId = (payload.new as any).id;
            const { data: updatedProject } = await supabase
              .from('projects')
              .select('*, clients(name)')
              .eq('id', updateId)
              .single();

            if (updatedProject) {
              const updated = updatedProject as ProjectWithClient;
              setProjects((prev) =>
                prev.map((p) => (p.id === updated.id ? updated : p))
              );
            }
          } else if (payload.eventType === 'DELETE') {
            const deleteId = (payload.old as any).id;
            setProjects((prev) => prev.filter((p) => p.id !== deleteId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const columns: ColumnDef<ProjectWithClient>[] = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'title',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              პროექტის სახელი
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
      },
      {
        accessorKey: 'clients.name',
        id: 'client',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              კლიენტი
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return <div>{row.original.clients?.name || 'N/A'}</div>;
        },
      },
      {
        accessorKey: 'current_stage',
        header: 'მიმდინარე სტადია',
        cell: ({ row }) => <StageBadge stage={row.getValue('current_stage')} />,
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },
      {
        accessorKey: 'updated_at',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              ბოლო განახლება
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(row.getValue('updated_at')), {
                addSuffix: true,
                locale: ka,
              })}
            </div>
          );
        },
      },
      {
        id: 'daysInStage',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              დღეები სტადიაში
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        accessorFn: (row) => {
          const days = Math.floor(
            (new Date().getTime() - new Date(row.updated_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          return days;
        },
        cell: ({ row }) => {
          const days = row.getValue('daysInStage') as number;
          return (
            <div className="text-sm">
              {days} დღე
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  const handleExportCSV = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const rowsToExport = selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows;

    const csvContent = [
      ['პროექტი', 'კლიენტი', 'სტადია', 'განახლება', 'დღეები სტადიაში'],
      ...rowsToExport.map((row) => [
        row.original.title,
        row.original.clients?.name || 'N/A',
        row.original.current_stage,
        new Date(row.original.updated_at).toLocaleDateString('ka-GE'),
        Math.floor(
          (new Date().getTime() - new Date(row.original.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        ).toString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `projects-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="ძებნა პროექტის ან კლიენტის სახელით..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />

        <div className="flex items-center gap-2">
          <Select
            value={(table.getColumn('current_stage')?.getFilterValue() as string[])?.join(',') || 'all'}
            onValueChange={(value) => {
              table.getColumn('current_stage')?.setFilterValue(value === 'all' ? undefined : [value]);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="ფილტრი სტადიით" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ყველა სტადია</SelectItem>
              {STAGE_CONFIGS.map((config) => (
                <SelectItem key={config.number} value={config.stage}>
                  {config.stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            ექსპორტი CSV
          </Button>

          {selectedCount > 0 && (
            <Button variant="outline" disabled>
              <Archive className="mr-2 h-4 w-4" />
              არქივი ({selectedCount})
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    იტვირთება...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="cursor-pointer"
                  onClick={() => {
                    window.location.href = `/dashboard/projects/${row.original.id}`;
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        if (cell.column.id === 'select') {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="text-muted-foreground">პროექტები არ მოიძებნა</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedCount > 0
            ? `არჩეულია ${selectedCount} პროექტი ${table.getFilteredRowModel().rows.length}-დან`
            : `სულ ${table.getFilteredRowModel().rows.length} პროექტი`}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            გვერდი {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
