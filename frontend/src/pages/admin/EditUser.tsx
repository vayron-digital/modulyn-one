import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { useToast } from '../../components/ui/use-toast';
import { supabase } from '../../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  personal_email: string;
  role: string;
  is_admin: boolean;
  department: string;
  phone: string;
  hire_date: string;
  profile_image_url: string;
  bio: string;
  skills: string[];
  certifications: string[];
  social_links: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  work_schedule: {
    start_time: string;
    end_time: string;
    timezone: string;
  };
  preferences: {
    notifications: boolean;
    theme: string;
    language: string;
  };
}

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    hireDate: '',
    bio: '',
    skills: '',
    certifications: '',
    linkedin: '',
    twitter: '',
    github: '',
    workStartTime: '09:00',
    workEndTime: '17:00',
    timezone: 'UTC',
    notifications: true,
    theme: 'light',
    language: 'en'
  });
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          fullName: data.full_name || '',
          email: data.personal_email || '',
          role: data.role || 'Agent',
          department: data.department || '',
          phone: data.phone || '',
          hireDate: data.hire_date || '',
          bio: data.bio || '',
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
          certifications: Array.isArray(data.certifications) ? data.certifications.join(', ') : '',
          linkedin: data.social_links?.linkedin || '',
          twitter: data.social_links?.twitter || '',
          github: data.social_links?.github || '',
          workStartTime: data.work_schedule?.start_time || '09:00',
          workEndTime: data.work_schedule?.end_time || '17:00',
          timezone: data.work_schedule?.timezone || 'UTC',
          notifications: data.preferences?.notifications !== false,
          theme: data.preferences?.theme || 'light',
          language: data.preferences?.language || 'en'
        });
        setProfileImageUrl(data.profile_image_url || null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError(error.message);
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
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
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      // Format the data for submission
      const formattedData = {
        full_name: formData.fullName,
        personal_email: formData.email,
        role: formData.role,
        is_admin: formData.role === 'Administrator',
        department: formData.department,
        phone: formData.phone,
        hire_date: formData.hireDate || null,
        bio: formData.bio,
        skills: formData.skills ? formData.skills.split(',').map(skill => skill.trim()) : [],
        certifications: formData.certifications ? formData.certifications.split(',').map(cert => cert.trim()) : [],
        social_links: {
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          github: formData.github
        },
        work_schedule: {
          start_time: formData.workStartTime,
          end_time: formData.workEndTime,
          timezone: formData.timezone
        },
        preferences: {
          notifications: formData.notifications,
          theme: formData.theme,
          language: formData.language
        }
      };
      const res = await fetch(`/api/team/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update user');
      navigate('/admin/users');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`/api/team/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete user');
      }
      navigate('/admin/users');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file || !id) return;
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);
      // Update profile_photo_url in profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('id', id);
      if (updateError) throw updateError;
      setProfileImageUrl(publicUrl);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (!profileImageUrl) {
    return <div className="p-8 text-center text-red-500">Access denied. Admins only.</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-purple-50">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader>
          <CardTitle>Edit User</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
                {errors.fullName && <div className="text-red-500 text-xs mt-1">{errors.fullName}</div>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  type="email"
                  required
                />
                {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="Agent">Agent</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  type="tel"
                />
              </div>
              <div>
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input
                  id="hireDate"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  type="date"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/users')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 text-white">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="destructive" disabled={loading} onClick={handleDelete} className="ml-2">
                Delete User
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 