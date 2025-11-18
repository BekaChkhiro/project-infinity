'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ka } from 'date-fns/locale';
import { Calendar as CalendarIcon, Download, Save, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { STAGE_CONFIGS } from '@/lib/stages';
import { Project, Client, ProjectStage } from '@/types/database.types';
import {
  getSavedFilters,
  createSavedFilter,
  deleteSavedFilter,
} from '@/lib/supabase/saved-filters';
import { showToast } from '@/lib/toast';
import { cn } from '@/lib/utils';

type FilterState = {
  stages: ProjectStage[];
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  clientFilter: 'all' | 'with-active' | 'with-completed';
  paymentStatus: 'all' | 'pending' | 'partial' | 'full';
  searchQuery: string;
};

export function AdvancedFilters() {
  const router = useRouter();
  const supabase = createClient();
  const [filters, setFilters] = useState<FilterState>({
    stages: [],
    dateFrom: undefined,
    dateTo: undefined,
    clientFilter: 'all',
    paymentStatus: 'all',
    searchQuery: '',
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedFilters, setSavedFilters] = useState<any[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [resultType, setResultType] = useState<'projects' | 'clients'>('projects');

  useEffect(() => {
    loadData();
    loadSavedFilters();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, projects, clients, resultType]);

  async function loadData() {
    try {
      const [projectsData, clientsData] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('name', { ascending: true }),
      ]);

      if (projectsData.data) setProjects(projectsData.data);
      if (clientsData.data) setClients(clientsData.data);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast.error('მონაცემების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  }

  async function loadSavedFilters() {
    try {
      const data = await getSavedFilters();
      setSavedFilters(data);
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  }

  function applyFilters() {
    let result = [...projects];

    // Filter by stages
    if (filters.stages.length > 0) {
      result = result.filter((p) => filters.stages.includes(p.current_stage));
    }

    // Filter by date range
    if (filters.dateFrom) {
      result = result.filter(
        (p) => new Date(p.created_at) >= filters.dateFrom!
      );
    }
    if (filters.dateTo) {
      result = result.filter(
        (p) => new Date(p.created_at) <= filters.dateTo!
      );
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Filter by payment status
    if (filters.paymentStatus !== 'all') {
      result = result.filter((p) => {
        if (!p.budget) return false;
        const paidPercentage = (p.paid_amount / p.budget) * 100;
        if (filters.paymentStatus === 'pending') return paidPercentage === 0;
        if (filters.paymentStatus === 'partial')
          return paidPercentage > 0 && paidPercentage < 100;
        if (filters.paymentStatus === 'full') return paidPercentage >= 100;
        return true;
      });
    }

    setFilteredProjects(result);
  }

  function handleStageToggle(stage: ProjectStage) {
    setFilters((prev) => ({
      ...prev,
      stages: prev.stages.includes(stage)
        ? prev.stages.filter((s) => s !== stage)
        : [...prev.stages, stage],
    }));
  }

  function clearFilters() {
    setFilters({
      stages: [],
      dateFrom: undefined,
      dateTo: undefined,
      clientFilter: 'all',
      paymentStatus: 'all',
      searchQuery: '',
    });
  }

  async function handleSaveFilter() {
    if (!filterName.trim()) {
      showToast.error('შეიყვანეთ ფილტრის სახელი');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await createSavedFilter({
        user_id: user.id,
        name: filterName,
        filter_type: 'projects',
        filters: filters,
      });

      showToast.success('ფილტრი წარმატებით შეინახა');
      setSaveDialogOpen(false);
      setFilterName('');
      loadSavedFilters();
    } catch (error) {
      console.error('Error saving filter:', error);
      showToast.error('ფილტრის შენახვა ვერ მოხერხდა');
    }
  }

  async function handleLoadFilter(savedFilter: any) {
    setFilters(savedFilter.filters);
    showToast.success(`ფილტრი "${savedFilter.name}" ჩაიტვირთა`);
  }

  async function handleDeleteFilter(filterId: string) {
    try {
      await deleteSavedFilter(filterId);
      showToast.success('ფილტრი წაიშალა');
      loadSavedFilters();
    } catch (error) {
      console.error('Error deleting filter:', error);
      showToast.error('ფილტრის წაშლა ვერ მოხერხდა');
    }
  }

  function exportToCSV() {
    if (filteredProjects.length === 0) {
      showToast.error('ექსპორტისთვის შედეგები არ არის');
      return;
    }

    const headers = ['სახელი', 'სტატუსი', 'ბიუჯეტი', 'გადახდილი', 'შექმნის თარიღი'];
    const rows = filteredProjects.map((p) => [
      p.title,
      p.current_stage,
      p.budget || 0,
      p.paid_amount || 0,
      format(new Date(p.created_at), 'dd/MM/yyyy'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `projects-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast.success('ფაილი ჩამოიტვირთა');
  }

  if (loading) {
    return <div className="text-center py-12">იტვირთება...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>სტატუსები</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['sales', 'development', 'payment', 'completion'].map((phase) => {
                const phaseStages = STAGE_CONFIGS.filter((s) => s.phase === phase);
                return (
                  <div key={phase}>
                    <h3 className="font-medium mb-2">{phaseStages[0]?.phaseLabel}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {phaseStages.map((stageConfig) => (
                        <div key={stageConfig.stage} className="flex items-center space-x-2">
                          <Checkbox
                            id={stageConfig.stage}
                            checked={filters.stages.includes(stageConfig.stage)}
                            onCheckedChange={() => handleStageToggle(stageConfig.stage)}
                          />
                          <Label
                            htmlFor={stageConfig.stage}
                            className="text-sm cursor-pointer"
                          >
                            {stageConfig.stage}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Other Filters */}
        <div className="space-y-4">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>ძებნა</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="ძებნა სახელის ან აღწერის მიხედვით..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              />
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle>თარიღის დიაპაზონი</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>დაწყება</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !filters.dateFrom && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom
                        ? format(filters.dateFrom, 'dd MMM yyyy', { locale: ka })
                        : 'აირჩიეთ თარიღი'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>დასრულება</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !filters.dateTo && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo
                        ? format(filters.dateTo, 'dd MMM yyyy', { locale: ka })
                        : 'აირჩიეთ თარიღი'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle>გადახდის სტატუსი</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={filters.paymentStatus}
                onValueChange={(value: any) =>
                  setFilters({ ...filters, paymentStatus: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ყველა</SelectItem>
                  <SelectItem value="pending">გადასახდელი</SelectItem>
                  <SelectItem value="partial">ნაწილობრივ გადახდილი</SelectItem>
                  <SelectItem value="full">სრულად გადახდილი</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <Button onClick={() => setSaveDialogOpen(true)} variant="outline" className="w-full">
                <Save className="h-4 w-4 mr-2" />
                ფილტრის შენახვა
              </Button>
              <Button onClick={clearFilters} variant="outline" className="w-full">
                <X className="h-4 w-4 mr-2" />
                ფილტრების გასუფთავება
              </Button>
              <Button onClick={exportToCSV} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                CSV ექსპორტი
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>შენახული ფილტრები</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 flex items-center gap-2"
                >
                  <span onClick={() => handleLoadFilter(filter)}>{filter.name}</span>
                  <button
                    onClick={() => handleDeleteFilter(filter.id)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              შედეგები ({filteredProjects.length} / {projects.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              შედეგები არ მოიძებნა
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>სახელი</TableHead>
                    <TableHead>სტატუსი</TableHead>
                    <TableHead>ბიუჯეტი</TableHead>
                    <TableHead>გადახდილი</TableHead>
                    <TableHead>შექმნის თარიღი</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => {
                    const stageConfig = STAGE_CONFIGS.find(
                      (s) => s.stage === project.current_stage
                    );
                    return (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div className="font-medium">{project.title}</div>
                          {project.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {project.description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {stageConfig && (
                            <Badge
                              variant="outline"
                              className={`${stageConfig.bgColor} ${stageConfig.borderColor}`}
                            >
                              <span className={stageConfig.color}>
                                {project.current_stage}
                              </span>
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {project.budget
                            ? `${project.budget.toLocaleString('ka-GE')} ₾`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {project.paid_amount
                            ? `${project.paid_amount.toLocaleString('ka-GE')} ₾`
                            : '0 ₾'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(project.created_at), 'dd MMM yyyy', {
                            locale: ka,
                          })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                          >
                            ნახვა
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Filter Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ფილტრის შენახვა</DialogTitle>
            <DialogDescription>
              შეიყვანეთ ფილტრის სახელი შესანახად
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="filter-name">სახელი</Label>
              <Input
                id="filter-name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="მაგ: აქტიური პროექტები"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              გაუქმება
            </Button>
            <Button onClick={handleSaveFilter}>შენახვა</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
