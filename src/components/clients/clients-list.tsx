'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ka } from 'date-fns/locale';
import {
  Search,
  Mail,
  Phone,
  Building2,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ClientFormDialog } from './client-form-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getClientsWithStats, deleteClient as removeClient } from '@/lib/supabase/clients';
import { ClientStatistics } from '@/types/database.types';
import { showToast } from '@/lib/toast';

type SortField = 'name' | 'company' | 'total_projects' | 'active_projects' | 'last_project_date' | 'total_revenue';
type SortDirection = 'asc' | 'desc';

export function ClientsListContent() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientStatistics[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterAndSortClients();
  }, [clients, searchQuery, sortField, sortDirection]);

  async function loadClients() {
    try {
      const data = await getClientsWithStats();
      setClients(data);
    } catch (error: any) {
      showToast.error('კლიენტების ჩატვირთვა ვერ მოხერხდა');
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterAndSortClients() {
    let result = [...clients];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.company?.toLowerCase().includes(query) ||
          client.email?.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      // Handle null values
      if (aVal === null) aVal = '';
      if (bVal === null) bVal = '';

      // Handle dates
      if (sortField === 'last_project_date') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredClients(result);
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }

  async function handleDelete(clientId: string) {
    try {
      await removeClient(clientId);
      showToast.success('კლიენტი წარმატებით წაიშალა');
      loadClients();
    } catch (error: any) {
      showToast.error('კლიენტის წაშლა ვერ მოხერხდა');
      console.error('Error deleting client:', error);
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  }

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
    >
      {children}
      <ArrowUpDown className="h-4 w-4" />
    </button>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">იტვირთება...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Search and Actions */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ძებნა სახელის, კომპანიის ან ელ. ფოსტის მიხედვით..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <ClientFormDialog onSuccess={loadClients} />
          </div>

          {/* Table */}
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? 'კლიენტები არ მოიძებნა' : 'კლიენტები არ არის დამატებული'}
              </p>
              {!searchQuery && (
                <div className="mt-4">
                  <ClientFormDialog onSuccess={loadClients} />
                </div>
              )}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <SortButton field="name">სახელი</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="company">კომპანია</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="total_projects">სულ პროექტები</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="active_projects">აქტიური პროექტები</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="last_project_date">ბოლო პროექტი</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="total_revenue">სულ შემოსავალი</SortButton>
                    </TableHead>
                    <TableHead className="w-[100px]">მოქმედებები</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {client.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {client.email}
                              </span>
                            )}
                            {client.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {client.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.company ? (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {client.company}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{client.total_projects}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-blue-600">
                          {client.active_projects}
                        </span>
                      </TableCell>
                      <TableCell>
                        {client.last_project_date ? (
                          format(new Date(client.last_project_date), 'dd MMM yyyy', {
                            locale: ka,
                          })
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {client.total_revenue?.toLocaleString('ka-GE')} ₾
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/clients/${client.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setClientToDelete(client.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary */}
          {filteredClients.length > 0 && (
            <div className="text-sm text-muted-foreground">
              სულ: {filteredClients.length} კლიენტი
              {searchQuery && ` (გაფილტრული ${clients.length}-დან)`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>დარწმუნებული ხართ?</AlertDialogTitle>
            <AlertDialogDescription>
              ეს მოქმედება შეუქცევადია. კლიენტი წაიშლება სამუდამოდ.
              გაითვალისწინეთ, რომ კლიენტის პროექტები არ წაიშლება.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>გაუქმება</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clientToDelete && handleDelete(clientToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              წაშლა
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
