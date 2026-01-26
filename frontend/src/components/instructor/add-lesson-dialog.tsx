'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BouncyClick from '../ui/bouncy-click';
import Spinner from '../ui/spinner';

interface AddLessonDialogProps {
  moduleId: string;
  orderIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newLesson: any) => void;
}

export function AddLessonDialog({
  moduleId,
  orderIndex,
  open,
  onOpenChange,
  onSuccess,
}: AddLessonDialogProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const newLesson = await apiClient.createLesson(moduleId, {
        title: title.trim(),
        content: '',
        contentType: 'markdown',
        orderIndex: orderIndex,
        estimatedDurationMinutes: 15,
      });
      onSuccess(newLesson);
      setTitle('');
      onOpenChange(false);
    } catch (error: any) {
      alert(error.message || 'Failed to add lesson');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
            <DialogDescription>
              Enter a title for the new lesson in this module.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lesson-title">Lesson Title</Label>
              <Input
                id="lesson-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Intro to HTML"
                autoFocus
                required
              />
            </div>
          </div>
          <DialogFooter>
            <BouncyClick>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </BouncyClick>
            <BouncyClick>
              <Button type="submit" disabled={loading || !title.trim()}>
                {loading ? (
                  <>
                    <Spinner size="sm" color="white" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  'Add Lesson'
                )}
              </Button>
            </BouncyClick>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
