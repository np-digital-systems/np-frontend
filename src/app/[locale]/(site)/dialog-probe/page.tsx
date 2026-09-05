'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DialogProbe() {
  const [open, setOpen] = useState(true);
  const [value, setValue] = useState('a');

  return (
    <div className="p-10">
      <Button id="reopen" onClick={() => setOpen(true)}>Reopen</Button>
      <p id="state" data-open={open ? 'yes' : 'no'}>dialog:{open ? 'open' : 'closed'}</p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Probe</DialogTitle>
            <DialogDescription>Probe dialog</DialogDescription>
          </DialogHeader>

          <Select value={value} onValueChange={setValue}>
            <SelectTrigger id="picker"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Alpha</SelectItem>
              <SelectItem value="b">Beta</SelectItem>
            </SelectContent>
          </Select>
        </DialogContent>
      </Dialog>
    </div>
  );
}
