'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuditLog } from '@/types/database.types';
import { getAuditLogs, exportAuditLogsCSV } from '@/lib/supabase/audit-logs';
import { showToast } from '@/lib/toast';
import { formatDistanceToNow } from 'date-fns';
import { ka } from 'date-fns/locale';

export function AuditLogList() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    loadLogs();
  }, [filterAction, filterEntity, filterDateFrom, filterDateTo, limit]);

  async function loadLogs() {
    try {
      setLoading(true);
      const data = await getAuditLogs({
        actionType: filterAction !== 'all' ? filterAction : undefined,
        entityType: filterEntity !== 'all' ? filterEntity : undefined,
        startDate: filterDateFrom || undefined,
        endDate: filterDateTo || undefined,
        limit,
      });
      setLogs(data);
    } catch (error: any) {
      console.error('Error loading audit logs:', error);
      showToast.error('ლოგების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  }

  const handleExport = async () => {
    try {
      const csv = await exportAuditLogsCSV({
        actionType: filterAction !== 'all' ? filterAction : undefined,
        entityType: filterEntity !== 'all' ? filterEntity : undefined,
        startDate: filterDateFrom || undefined,
        endDate: filterDateTo || undefined,
      });

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit-log-${new Date().toISOString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast.success('ლოგები ექსპორტირებულია');
    } catch (error: any) {
      console.error('Error exporting logs:', error);
      showToast.error('ექსპორტი ვერ მოხერხდა');
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'შექმნა',
      update: 'განახლება',
      delete: 'წაშლა',
      stage_change: 'ეტაპის შეცვლა',
      status_change: 'სტატუსის შეცვლა',
      assign: 'მინიჭება',
    };
    return labels[action] || action;
  };

  const getEntityLabel = (entity: string) => {
    const labels: Record<string, string> = {
      project: 'პროექტი',
      client: 'კლიენტი',
      user: 'მომხმარებელი',
      automation_rule: 'ავტომატიზაცია',
      email_template: 'შაბლონი',
    };
    return labels[entity] || entity;
  };

  if (loading && logs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">იტვირთება...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            აუდიტის ლოგი
            <Badge variant="secondary">{logs.length}</Badge>
          </CardTitle>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            ექსპორტი (CSV)
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-4 p-4 bg-muted rounded-lg">
          <div>
            <Label className="text-xs">მოქმედება</Label>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger>
                <SelectValue placeholder="ყველა" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ყველა</SelectItem>
                <SelectItem value="create">შექმნა</SelectItem>
                <SelectItem value="update">განახლება</SelectItem>
                <SelectItem value="delete">წაშლა</SelectItem>
                <SelectItem value="stage_change">ეტაპის შეცვლა</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">ობიექტი</Label>
            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger>
                <SelectValue placeholder="ყველა" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ყველა</SelectItem>
                <SelectItem value="project">პროექტი</SelectItem>
                <SelectItem value="client">კლიენტი</SelectItem>
                <SelectItem value="user">მომხმარებელი</SelectItem>
                <SelectItem value="automation_rule">ავტომატიზაცია</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">დან</Label>
            <Input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">მდე</Label>
            <Input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              ლოგები არ მოიძებნა მითითებული ფილტრებით
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>მოქმედება</TableHead>
                <TableHead>ობიექტი</TableHead>
                <TableHead>აღწერა</TableHead>
                <TableHead>დრო</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {getActionLabel(log.action_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getEntityLabel(log.entity_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {log.entity_type} - {log.entity_id || 'N/A'}
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {JSON.stringify(log.metadata).substring(0, 50)}...
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(log.created_at), {
                        addSuffix: true,
                        locale: ka,
                      })}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {logs.length >= limit && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => setLimit(limit + 50)}
            >
              მეტის ჩატვირთვა
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
