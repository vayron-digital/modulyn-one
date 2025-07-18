import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, FormGroup } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { 
  Calendar, 
  User, 
  Tag, 
  MessageSquare,
  Clock,
  Edit,
  Trash,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  due_date: string;
  assigned_to: {
    id: string;
    name: string;
    avatar_url: string;
  };
  created_by: {
    id: string;
    name: string;
  };
  tags: string[];
  related_to_type?: string;
  related_to_id?: string;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    avatar_url: string;
  };
  created_at: string;
}

interface Activity {
  id: string;
  type: string;
  action: string;
  description: string;
  user: {
    name: string;
  };
  created_at: string;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const statusColors = {
  todo: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  review: 'bg-purple-100 text-purple-800',
  done: 'bg-green-100 text-green-800'
};

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTask();
      fetchComments();
      fetchActivities();
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to:users!tasks_assigned_to_fkey(id, name, avatar_url),
          created_by:users!tasks_created_by_fkey(id, name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setTask(data);
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select(`
          *,
          user:users(id, name, avatar_url)
        `)
        .eq('task_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          user:users(name)
        `)
        .eq('related_to_type', 'task')
        .eq('related_to_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (!task) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (error) throw error;

      await supabase.rpc('log_activity', {
        p_type: 'task',
        p_action: 'update',
        p_description: `Updated task status to ${newStatus}`,
        p_metadata: { task_id: task.id }
      });

      fetchTask();
      fetchActivities();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;

    setSubmitting(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { error: insertError } = await supabase
        .from('task_comments')
        .insert([{
          task_id: task.id,
          content: newComment.trim(),
          user_id: user.id
        }]);

      if (insertError) throw insertError;

      await supabase.rpc('log_activity', {
        p_type: 'task',
        p_action: 'comment',
        p_description: 'Added a comment',
        p_metadata: { task_id: task.id }
      });

      setNewComment('');
      fetchComments();
      fetchActivities();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;

      await supabase.rpc('log_activity', {
        p_type: 'task',
        p_action: 'delete',
        p_description: 'Deleted task',
        p_metadata: { task_id: task.id }
      });

      navigate('/tasks');
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Task not found</h2>
        <p className="mt-2 text-gray-500">The task you're looking for doesn't exist or has been deleted.</p>
        <Button
          className="mt-4"
          onClick={() => navigate('/tasks')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/tasks')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{task.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/tasks/${task.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Details */}
          <Card className="p-6">
            <div className="prose max-w-none">
              <h2 className="text-lg font-semibold mb-4">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className={statusColors[task.status]}>
                    {task.status}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange('todo')}
                      className={task.status === 'todo' ? 'bg-gray-100' : ''}
                    >
                      <AlertCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange('in_progress')}
                      className={task.status === 'in_progress' ? 'bg-blue-100' : ''}
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange('done')}
                      className={task.status === 'done' ? 'bg-green-100' : ''}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                <div className="mt-1">
                  <Badge className={priorityColors[task.priority]}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                <div className="mt-1 flex items-center text-gray-900">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(task.due_date), 'MMM d, yyyy')}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
                <div className="mt-1 flex items-center text-gray-900">
                  <User className="h-4 w-4 mr-2" />
                  {task.assigned_to.name}
                </div>
              </div>
            </div>

            {task.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Comments */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Comments</h2>
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex gap-2">
                <FormGroup label="Add a comment...">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                  />
                </FormGroup>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </form>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <img
                    src={comment.user.avatar_url}
                    alt={comment.user.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.user.name}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-600">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Activity Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Activity</h2>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.user.name}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-600">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 