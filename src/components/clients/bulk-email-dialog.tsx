'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail } from 'lucide-react';
import { ProjectStage } from '@/types/database.types';
import { STAGE_CONFIGS } from '@/lib/stages';
import { showToast } from '@/lib/toast';

export function BulkEmailDialog() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<ProjectStage | 'all'>('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    // In a real implementation, this would:
    // 1. Query clients with projects in the selected stage
    // 2. Send emails via an email service (SendGrid, Resend, etc.)
    // 3. Track email status

    // For now, we'll just create mailto links
    if (!subject || !message) {
      showToast.error('გთხოვთ შეავსოთ ყველა ველი');
      return;
    }

    // This is a simplified version - in production you'd use an email service
    showToast.success('ფუნქციონალი მოითხოვს ელ. ფოსტის სერვისის კონფიგურაციას (SendGrid, Resend, და ა.შ.)');
    setOpen(false);
    setSubject('');
    setMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="h-4 w-4 mr-2" />
          ჯგუფური ელ. ფოსტა
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ჯგუფური ელ. ფოსტის გაგზავნა</DialogTitle>
          <DialogDescription>
            გაუგზავნეთ ელ. ფოსტა კლიენტებს, რომელთა პროექტებიც განსაზღვრულ სტადიაშია
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stage Filter */}
          <div className="space-y-2">
            <Label htmlFor="stage">პროექტის სტადია</Label>
            <Select value={stage} onValueChange={(value: any) => setStage(value)}>
              <SelectTrigger id="stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ყველა სტადია</SelectItem>
                {STAGE_CONFIGS.map((config) => (
                  <SelectItem key={config.stage} value={config.stage}>
                    {config.stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              ელ. ფოსტა გაეგზავნება კლიენტებს, რომელთა პროექტებიც ამ სტადიაშია
            </p>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">თემა</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="მაგ: პროექტის სტატუსის განახლება"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">შეტყობინება</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="თქვენი შეტყობინება..."
              rows={8}
            />
            <p className="text-xs text-muted-foreground">
              შეგიძლიათ გამოიყენოთ ცვლადები: {'{client_name}'}, {'{project_title}'}, {'{current_stage}'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            გაუქმება
          </Button>
          <Button onClick={handleSend}>
            <Mail className="h-4 w-4 mr-2" />
            გაგზავნა
          </Button>
        </DialogFooter>

        {/* Implementation Note */}
        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-semibold mb-1">განვითარების შენიშვნა:</p>
          <p className="text-muted-foreground">
            სრული ფუნქციონალისთვის საჭიროა ელ. ფოსტის სერვისის (SendGrid, Resend, AWS SES, და ა.შ.) ინტეგრაცია.
            ამჟამად ეს არის UI დემონსტრაცია.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
