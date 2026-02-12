import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { listComments, createComment } from '@/api/comments';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CommentsSectionProps {
  valueId: number;
}

export default function CommentsSection({ valueId }: CommentsSectionProps) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', valueId],
    queryFn: () => listComments(valueId),
  });

  const addMutation = useMutation({
    mutationFn: (commentText: string) => createComment(valueId, { text: commentText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', valueId] });
      setText('');
      toast.success('Comment added');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    addMutation.mutate(text.trim());
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <div className="mt-2 space-y-2 rounded-md border border-border bg-background p-3">
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted-foreground">No comments yet</p>
      ) : (
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c.id} className="text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{c.author_name ?? 'Unknown'}</span>
                <span className="text-xs text-muted-foreground">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="h-8 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          disabled={!text.trim() || addMutation.isPending}
          className="h-8 w-8 shrink-0 p-0"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
