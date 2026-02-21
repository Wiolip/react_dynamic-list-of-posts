import { useEffect, useState } from 'react';
import { client } from '../utils/fetchClient';
import { Post } from '../types/Post';

export function usePosts(userId: number | null) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState(false);

  useEffect(() => {
    if (!userId) {
      setPosts([]);

      return;
    }

    const loadPosts = async () => {
      setPostsLoading(true);
      setPostsError(false);

      try {
        const data = await client.get<Post[]>(`/posts?userId=${userId}`);

        setPosts(data);
      } catch {
        setPosts([]);
        setPostsError(true);
      } finally {
        setPostsLoading(false);
      }
    };

    loadPosts();
  }, [userId]);

  return { posts, postsLoading, postsError };
}
