import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input, FormGroup } from '../../components/ui';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import FullScreenLoader from '../../components/common/FullScreenLoader';
import { useToast } from '../../components/ui/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui';

interface TaskFormData {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  assigned_to: string;
}

export default function TaskForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<{ id: string; full_name: string; profile_photo_url?: string }[]>([]);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: new Date().toISOString().split('T')[0],
    assigned_to: '',
  });
  const [errors, setErrors] = useState<any>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    if (id) {
      fetchTask();
    }
  }, [id]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, profile_photo_url')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message);
    }
  };

  const fetchTask = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          due_date: new Date(data.due_date).toISOString().split('T')[0],
          assigned_to: data.assigned_to,
        });
      }
    } catch (error: any) {
      console.error('Error fetching task:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.due_date) newErrors.due_date = 'Due date is required';
    if (!formData.assigned_to) newErrors.assigned_to = 'Assignee is required';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast({ title: 'Validation Error', description: 'Please fix the errors in the form.', variant: 'destructive' });
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const taskData = {
        ...formData,
        created_by: user?.id,
        updated_at: new Date().toISOString(),
      };

      if (id) {
        const { error } = await supabase
          .from('tasks')
          .update(taskData)
          .eq('id', id);
        if (error) throw error;
        toast({ title: 'Task updated', description: 'Task updated successfully.', variant: 'success' });
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([taskData]);
        if (error) throw error;
        toast({ title: 'Task created', description: 'Task created successfully.', variant: 'success' });
      }

      navigate('/tasks');
    } catch (error: any) {
      console.error('Error saving task:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save task.', variant: 'destructive' });
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <FullScreenLoader />;

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-purple-50">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle>{id ? 'Edit Task' : 'New Task'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Title">
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
              </FormGroup>
              <FormGroup label="Due Date">
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
                {errors.due_date && <div className="text-red-500 text-xs mt-1">{errors.due_date}</div>}
              </FormGroup>
              <FormGroup label="Assign To">
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <span className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            {user.profile_photo_url ? (
                              <AvatarImage src={user.profile_photo_url} alt={user.full_name} />
                            ) : (
                              <AvatarFallback>{user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}</AvatarFallback>
                            )}
                          </Avatar>
                          <span>{user.full_name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.assigned_to && <div className="text-red-500 text-xs mt-1">{errors.assigned_to}</div>}
              </FormGroup>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'pending' | 'in_progress' | 'completed') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tasks')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 text-white">
                {loading ? 'Saving...' : id ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 