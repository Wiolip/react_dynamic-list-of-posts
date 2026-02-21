import { useEffect, useState } from 'react';
import { client } from '../utils/fetchClient';
import { Comment } from '../types/Comment';

export function useComments(postId: number | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(false);

  useEffect(() => {
    if (!postId) {
      setComments([]);

      return;
    }

    setCommentsLoading(true);
    setCommentsError(false);

    client
      .get<Comment[]>(`/comments?postId=${postId}`)
      .then(setComments)
      .catch(() => {
        setComments([]);
        setCommentsError(true);
      })
      .finally(() => setCommentsLoading(false));
  }, [postId]);

  const handleDeleteComment = async (id: number) => {
    const previous = comments;

    setComments(prev => prev.filter(c => c.id !== id));

    try {
      await client.delete(`/comments/${id}`);
    } catch {
      setComments(previous);
      setCommentsError(true);
    }
  };

  const handleAddComment = async (
    name: string,
    email: string,
    body: string,
  ) => {
    if (!postId) {
      return;
    }

    try {
      const newComment = await client.post<Comment>('/comments', {
        postId,
        name,
        email,
        body,
      });

      setComments(prev => [...prev, newComment]);
    } catch {
      setCommentsError(true);
    }
  };

  return {
    comments,
    commentsLoading,
    commentsError,
    handleDeleteComment,
    handleAddComment,
  };
}
