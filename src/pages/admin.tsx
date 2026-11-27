import { useState, useEffect, useRef, useCallback, RefObject } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ArrowUp, ArrowDown, Edit, Trash, Plus, Calendar, Search, Tag } from 'lucide-react';
import { useRequireAuth } from '@/context/AuthContext';

interface Blog {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  tags?: string[];
  order: number;
}

const ItemType = 'BLOG';

interface DraggableBlogProps {
  blog: Blog;
  index: number;
  canReorder: boolean;
  moveLocal: (fromIndex: number, toIndex: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  handleEdit: (blog: Blog) => void;
  handleDelete: (blog: Blog) => void;
  handleMoveUp: (index: number) => void;
  handleMoveDown: (index: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

const DraggableBlog = ({
  blog, index, canReorder, moveLocal, onDragStart, onDragEnd,
  handleEdit, handleDelete, handleMoveUp, handleMoveDown, isFirst, isLast,
}: DraggableBlogProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    canDrag: canReorder,
    item: () => {
      onDragStart();
      return { index };
    },
    // Save once, when the post is dropped, instead of on every hover step.
    end: () => onDragEnd(),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const elementRef = useRef<HTMLDivElement | null>(null);
  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem: { index: number }, monitor) => {
      const from = draggedItem.index;
      if (from === index || !elementRef.current) return;
      // Only swap once the cursor crosses the middle of the hovered card;
      // otherwise cards of different heights flip back and forth.
      const rect = elementRef.current.getBoundingClientRect();
      const pointer = monitor.getClientOffset();
      if (!pointer) return;
      const middleY = (rect.bottom - rect.top) / 2;
      const pointerY = pointer.y - rect.top;
      if (from < index && pointerY < middleY) return;
      if (from > index && pointerY > middleY) return;
      moveLocal(from, index);
      draggedItem.index = index;
    },
  });

  const ref = (node: HTMLDivElement | null) => {
    elementRef.current = node;
    drag(node);
    drop(node);
  };

  const uniqueTags = [...new Set(blog.tags?.length ? blog.tags : ['General'])];

  return (
    <div
      ref={ref as unknown as RefObject<HTMLDivElement>}
      className={`p-4 border border-gray-200 rounded-lg flex justify-between items-start ${
        canReorder ? 'cursor-grab' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-black">{blog.title}</h3>
        <div className="flex items-center gap-6 mt-1 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <p className="text-sm text-gray-500">
              {new Date(blog.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <div className="flex items-center gap-1 flex-wrap">
              {uniqueTags.map((tag) => (
                <div key={tag} className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                  <span className="font-bold">{tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Move up"
          onClick={() => handleMoveUp(index)}
          disabled={!canReorder || isFirst}
          className="text-gray-800 hover:text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Move down"
          onClick={() => handleMoveDown(index)}
          disabled={!canReorder || isLast}
          className="text-gray-800 hover:text-blue-500 disabled:text-gray-300 disabled:cursor-not-allowed"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
        <button type="button" aria-label="Edit" onClick={() => handleEdit(blog)} className="text-gray-800 hover:text-blue-500">
          <Edit className="h-5 w-5" />
        </button>
        <button type="button" aria-label="Delete" onClick={() => handleDelete(blog)} className="text-red-500 hover:text-red-600">
          <Trash className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default function Admin() {
  const { status, handleUnauthorized } = useRequireAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Latest list, updated synchronously so the drag-end callback never reads a
  // stale copy, and the list as it was before a drag began.
  const blogsRef = useRef<Blog[]>([]);
  const beforeDragRef = useRef<Blog[] | null>(null);
  const updateBlogs = useCallback((next: Blog[]) => {
    blogsRef.current = next;
    setBlogs(next);
  }, []);

  const handleApiError = useCallback(
    (err: unknown, fallback: string) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || fallback);
    },
    [handleUnauthorized]
  );

  const fetchBlogs = useCallback(async () => {
    try {
      const res = await axios.get('/api/blogs');
      updateBlogs(res.data);
      setError(null);
    } catch (err) {
      handleApiError(err, 'Failed to load posts. Please try again.');
    }
  }, [handleApiError, updateBlogs]);

  useEffect(() => {
    if (status === 'authenticated') fetchBlogs();
  }, [status, fetchBlogs]);

  const saveOrder = async (next: Blog[], previous: Blog[]) => {
    try {
      await axios.put('/api/blogs/reorder', { ids: next.map((b) => b._id) });
      setError(null);
    } catch (err) {
      updateBlogs(previous);
      handleApiError(err, 'Failed to save the new order. Changes were reverted.');
      fetchBlogs();
    }
  };

  const moveLocal = useCallback(
    (fromIndex: number, toIndex: number) => {
      const next = [...blogsRef.current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      updateBlogs(next);
    },
    [updateBlogs]
  );

  const onDragStart = () => {
    beforeDragRef.current = blogsRef.current;
  };

  const onDragEnd = () => {
    const previous = beforeDragRef.current;
    beforeDragRef.current = null;
    const current = blogsRef.current;
    if (!previous || previous.every((b, i) => b._id === current[i]?._id)) return; // nothing moved
    saveOrder(current, previous);
  };

  const moveAndSave = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= blogs.length) return;
    const previous = blogsRef.current;
    const next = [...previous];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    updateBlogs(next);
    saveOrder(next, previous);
  };

  const handleEdit = (blog: Blog) => {
    router.push(`/admin/create-post?id=${blog._id}`);
  };

  const handleDelete = async (blog: Blog) => {
    if (!window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/blogs/${blog._id}`);
      setError(null);
      fetchBlogs();
    } catch (err) {
      handleApiError(err, 'Failed to delete the post. Please try again.');
    }
  };

  const query = searchQuery.trim().toLowerCase();
  const filteredBlogs = query
    ? blogs.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) ||
          (blog.tags || []).some((tag) => tag.toLowerCase().includes(query))
      )
    : blogs;
  // Positions only make sense on the full list, so reordering pauses while searching.
  const canReorder = !query;

  if (status !== 'authenticated') return null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-[#FAF9F6] flex flex-col">
        <div className="container mx-auto px-4 pt-4 pb-8 flex-grow">
          <div className="max-w-[1325px] mx-auto">
            <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
              <h1 className="text-5xl font-bold text-black">Admin Panel</h1>
              <Link
                href="/admin/create-post"
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                <Plus className="h-5 w-5" />
                <span className="text-base font-medium">Create New Post</span>
              </Link>
            </div>
            {error && (
              <div role="alert" className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts by title or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {!canReorder && (
                  <p className="mt-2 text-sm text-gray-500">Clear the search to reorder posts.</p>
                )}
              </div>
              <div className="flex flex-col gap-4">
                {filteredBlogs.map((blog, index) => (
                  <DraggableBlog
                    key={blog._id}
                    blog={blog}
                    index={index}
                    canReorder={canReorder}
                    moveLocal={moveLocal}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handleMoveUp={(i) => moveAndSave(i, i - 1)}
                    handleMoveDown={(i) => moveAndSave(i, i + 1)}
                    isFirst={index === 0}
                    isLast={index === filteredBlogs.length - 1}
                  />
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-500 rounded-lg">
                Showing {filteredBlogs.length} of {blogs.length} posts
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
