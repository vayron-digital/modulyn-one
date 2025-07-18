import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/common/FormField';
import { FormSection } from '@/components/common/FormSection';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useActivityLog } from '@/hooks/useActivityLog';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  avatar_url: string;
}

export default function NewTask() {
  const navigate = useNavigate();
  const { logActivity } = useActivityLog();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const validationRules = {
    title: { required: true },
    description: { required: true },
    priority: { required: true },
    status: { required: true },
    due_date: { required: true },
    assigned_to: { required: true }
  };

  const { errors, validate, clearErrors } = useFormValidation(validationRules);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: format(new Date(), 'yyyy-MM-dd'),
    assigned_to: '',
    tags: '',
    related_to_type: '',
    related_to_id: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearErrors(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validate(formData)) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { error: insertError } = await supabase
        .from('tasks')
        .insert([{
          ...formData,
          created_by: user.id,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
        }]);

      if (insertError) throw insertError;

      await logActivity(
        'task',
        'create',
        `Created new task: ${formData.title}`,
        { task_id: formData.id }
      );

      navigate('/tasks');
    } catch (error: any) {
      console.error('Error creating task:', error);
      validate({ ...formData, submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Task</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection
          title="Task Information"
          description="Enter the basic details of the task"
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
          description="Add tags and related items"
        >
          <FormField
            label="Tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Enter tags separated by commas"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Related To Type"
              name="related_to_type"
              type="select"
              value={formData.related_to_type}
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
                value={formData.related_to_id}
                onChange={handleChange}
                options={[]} // This will be populated based on the selected type
              />
            )}
          </div>
        </FormSection>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/tasks')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
} 