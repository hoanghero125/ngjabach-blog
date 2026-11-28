import { useEffect, useState } from 'react';
import axios from 'axios';
import type { PostSummary } from '@/components/Blocks';
import { excerpt, readingTime } from '@/lib/text';

interface ApiBlog {
  _id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
  category?: string;
  tags?: string[];
}

export type PostWithTags = PostSummary & { tags: string[] };

/** Loads all posts (in the order set in the admin panel) as light summaries. */
export function usePosts() {
  const [posts, setPosts] = useState<PostWithTags[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    axios
      .get<ApiBlog[]>('/api/blogs')
      .then((res) => {
        if (cancelled) return;
        setPosts(
          res.data.map((b) => ({
            _id: b._id,
            slug: b.slug,
            title: b.title,
            createdAt: b.createdAt,
            category: b.category,
            tags: b.tags || [],
            summary: excerpt(b.content),
            minutes: readingTime(b.content),
          }))
        );
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, []);

  return { posts, status };
}
