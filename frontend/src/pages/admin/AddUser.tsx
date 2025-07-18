import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { useToast } from '../../components/ui/use-toast';

interface UserFormData {
  // Personal Information
  first_name: string;
  last_name: string;
  phone: string;
  alternate_contact: string;
  dob: string;
  date_of_joining: string;
  blood_group: string;
  nationality: string;
  marital_status: string;
  is_bachelor: boolean;
  medical_conditions: string;
  
  // Emergency Contact
  emergency_contact_name: string;
  emergency_contact_number: string;
  emergency_contact_relationship: string;
  
  // Address
  address: string;
  current_address_uae: string;
  
  // Contact Information
  email: string;
  personal_email: string;
  home_country_contact: string;
  
  // Employment Details
  role: string;
  designation: string;
  reporting_person: string;
  status: string;
  company: string;
  availability: string;
  
  // Document Information
  passport_number: string;
  passport_expiry: string;
  visa_expiry: string;
  visa_number: string;
  visa_type: string;
  
  // Education & Bank Details
  education_details: string;
  bank_name: string;
  bank_ifsc: string;
  bank_account_number: string;
  password: string;
  confirm_password: string;
}

function AddUser() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    first_name: '',
    last_name: '',
    phone: '',
    alternate_contact: '',
    dob: '',
    date_of_joining: '',
    blood_group: '',
    nationality: '',
    marital_status: '',
    is_bachelor: false,
    medical_conditions: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    emergency_contact_relationship: '',
    address: '',
    current_address_uae: '',
    email: '',
    personal_email: '',
    home_country_contact: '',
    role: 'user',
    designation: '',
    reporting_person: '',
    status: 'active',
    company: '',
    availability: 'available',
    passport_number: '',
    passport_expiry: '',
    visa_expiry: '',
    visa_number: '',
    visa_type: '',
    education_details: '',
    bank_name: '',
    bank_ifsc: '',
    bank_account_number: '',
    password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
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
    setSuccess(null);

    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            role: formData.role
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Then create the profile with upsert to handle potential conflicts
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: `${formData.first_name} ${formData.last_name}`,
          email: formData.email,
          role: formData.role,
          is_active: formData.status === 'active',
          phone: formData.phone || null,
          alternate_contact: formData.alternate_contact || null,
          dob: formData.dob || null,
          date_of_joining: formData.date_of_joining || null,
          blood_group: formData.blood_group || null,
          nationality: formData.nationality || null,
          marital_status: formData.marital_status || null,
          is_bachelor: formData.is_bachelor,
          medical_conditions: formData.medical_conditions || null,
          emergency_contact_name: formData.emergency_contact_name || null,
          emergency_contact_number: formData.emergency_contact_number || null,
          emergency_contact_relationship: formData.emergency_contact_relationship || null,
          address: formData.address || null,
          current_address_uae: formData.current_address_uae || null,
          personal_email: formData.personal_email || null,
          home_country_contact: formData.home_country_contact || null,
          designation: formData.designation || null,
          reporting_person: formData.reporting_person || null,
          company: formData.company || null,
          availability: formData.availability,
          passport_number: formData.passport_number || null,
          passport_expiry: formData.passport_expiry || null,
          visa_expiry: formData.visa_expiry || null,
          visa_number: formData.visa_number || null,
          visa_type: formData.visa_type || null,
          education_details: formData.education_details || null,
          bank_name: formData.bank_name || null,
          bank_ifsc: formData.bank_ifsc || null,
          bank_account_number: formData.bank_account_number || null
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create user profile. Please try again.');
      }

      setSuccess('User created successfully.');
      
      // Wait for 2 seconds before redirecting
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-purple-50">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
          )}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input name="first_name" value={formData.first_name} onChange={handleInputChange} required />
                {errors.first_name && <div className="text-red-500 text-xs mt-1">{errors.first_name}</div>}
              </div>
              <div>
                <Label>Last Name</Label>
                <Input name="last_name" value={formData.last_name} onChange={handleInputChange} required />
                {errors.last_name && <div className="text-red-500 text-xs mt-1">{errors.last_name}</div>}
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" value={formData.email} onChange={handleInputChange} type="email" required />
                {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
              </div>
              <div>
                <Label>Personal Email</Label>
                <Input name="personal_email" value={formData.personal_email} onChange={handleInputChange} type="email" />
              </div>
              <div>
                <Label>Password</Label>
                <Input name="password" value={formData.password} onChange={handleInputChange} type="password" required />
                {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
              </div>
              <div>
                <Label>Confirm Password</Label>
                <Input name="confirm_password" value={formData.confirm_password} onChange={handleInputChange} type="password" required />
                {errors.confirm_password && <div className="text-red-500 text-xs mt-1">{errors.confirm_password}</div>}
              </div>
              <div>
                <Label>Phone</Label>
                <Input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" />
              </div>
              <div>
                <Label>Nationality</Label>
                <Input name="nationality" value={formData.nationality} onChange={handleInputChange} />
              </div>
              <div>
                <Label>Role</Label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div>
                <Label>Designation</Label>
                <Input name="designation" value={formData.designation} onChange={handleInputChange} />
              </div>
              <div>
                <Label>Reporting Person</Label>
                <Input name="reporting_person" value={formData.reporting_person} onChange={handleInputChange} />
              </div>
              <div>
                <Label>Status</Label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 text-white">
                {loading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddUser; 