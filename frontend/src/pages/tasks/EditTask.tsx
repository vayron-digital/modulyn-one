import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/common/FormField';
import { FormSection } from '@/components/common/FormSection';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useActivityLog } from '@/hooks/useActivityLog';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar_url: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  due_date: string;
  assigned_to: string;
  tags: string[];
  related_to_type?: string;
  related_to_id?: string;
}

export default function EditTask() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logActivity } = useActivityLog();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [relatedItems, setRelatedItems] = useState<any[]>([]);

  const validationRules = {
    title: { required: true },
    description: { required: true },
    priority: { required: true },
    status: { required: true },
    due_date: { required: true },
    assigned_to: { required: true }
  };

  const { errors, validate, clearErrors } = useFormValidation(validationRules);

  const [formData, setFormData] = useState<Task>({
    id: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    assigned_to: '',
    tags: [],
    related_to_type: '',
    related_to_id: ''
  });

  useEffect(() => {
    if (id) {
      fetchTask();
      fetchUsers();
    }
  }, [id]);

  useEffect(() => {
    if (formData.related_to_type) {
      fetchRelatedItems(formData.related_to_type);
    }
  }, [formData.related_to_type]);

  const fetchTask = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        ...data,
        due_date: format(new Date(data.due_date), 'yyyy-MM-dd'),
        tags: data.tags || []
      });
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, avatar_url')
        .order('name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRelatedItems = async (type: string) => {
    try {
      let query = supabase.from(type + 's').select('id, name');
      
      switch (type) {
        case 'lead':
          query = query.select('id, name, email');
          break;
        case 'property':
          query = query.select('id, name, address');
          break;
        case 'document':
          query = query.select('id, name, type');
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      setRelatedItems(data || []);
    } catch (error) {
      console.error('Error fetching related items:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearErrors(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!validate(formData)) {
      setSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...formData,
          tags: formData.tags
        })
        .eq('id', id);

      if (error) throw error;

      await logActivity(
        'task',
        'update',
        `Updated task: ${formData.title}`,
        { task_id: id }
      );

      navigate(`/tasks/${id}`);
    } catch (error: any) {
      console.error('Error updating task:', error);
      validate({ ...formData, submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/tasks/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Task</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection
          title="Task Information"
          description="Update the basic details of the task"
        >
          <FormField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            required
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Priority"
              name="priority"
              type="select"
              value={formData.priority}
              onChange={handleChange}
              error={errors.priority}
              required
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' }
              ]}
            />

            <FormField
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleChange}
              error={errors.status}
              required
              options={[
                { value: 'todo', label: 'To Do' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'review', label: 'Review' },
                { value: 'done', label: 'Done' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Due Date"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={handleChange}
              error={errors.due_date}
              required
            />

            <FormField
              label="Assigned To"
              name="assigned_to"
              type="select"
              value={formData.assigned_to}
              onChange={handleChange}
              error={errors.assigned_to}
              required
              options={users.map(user => ({
                value: user.id,
                label: user.name
              }))}
            />
          </div>
        </FormSection>

        <FormSection
          title="Additional Information"
          description="Update tags and related items"
        >
          <FormField
            label="Tags"
            name="tags"
            value={formData.tags.join(', ')}
            onChange={(e) => {
              const tags = e.target.value.split(',').map(tag => tag.trim());
              setFormData(prev => ({ ...prev, tags }));
            }}
            placeholder="Enter tags separated by commas"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Related To Type"
              name="related_to_type"
              type="select"
              value={formData.related_to_type || ''}
              onChange={handleChange}
              options={[
                { value: '', label: 'None' },
                { value: 'lead', label: 'Lead' },
                { value: 'property', label: 'Property' },
                { value: 'document', label: 'Document' }
              ]}
            />

            {formData.related_to_type && (
              <FormField
                label="Related Item"
                name="related_to_id"
                type="select"
                value={formData.related_to_id || ''}
                onChange={handleChange}
                options={relatedItems.map(item => ({
                  value: item.id,
                  label: item.name
                }))}
              />
            )}
          </div>
        </FormSection>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/tasks/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
} 