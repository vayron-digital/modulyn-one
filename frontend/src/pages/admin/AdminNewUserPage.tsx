import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import FullScreenLoader from '../../components/common/FullScreenLoader';

const ROLES = ['admin', 'agent', 'team_leader', 'jr_team_leader', 'other'];
const DESIGNATIONS = ['Agent', 'Jr. Team Leader', 'Team Leader', 'Director', 'Head of Sales', 'Other'];

interface SectionProps {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  className?: string;
}

function Section({ title, children, open, onToggle, className }: SectionProps) {
  return (
    <div className={`mb-4 border rounded ${className || ''}`}>
      <div className="flex items-center justify-between bg-gray-100 px-4 py-2 cursor-pointer" onClick={onToggle}>
        <span className="font-semibold">{title}</span>
        <span>{open ? '-' : '+'}</span>
      </div>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

export default function AdminNewUserPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<{ [key: string]: any } & {
    first_name: string; last_name: string; phone: string; alt_contact: string; email: string; password: string; profile_pic: string;
    date_of_joining: string; role: string; designation: string; reporting_person: string; status: string; availability: string; prev_employer: string; allow_exclusion: boolean;
    dob: string; blood_group: string; nationality: string; marital_status: string; address_uae: string; home_country_contact: string; personal_email: string;
    emergency_name: string; emergency_number: string; emergency_relation: string;
    passport_number: string; passport_expiry: string; visa_number: string; visa_expiry: string; visa_type: string;
    education: string; bank_name: string; ifsc: string; iban: string; bank_account: string;
  }>({
    first_name: '', last_name: '', phone: '', alt_contact: '', email: '', password: '', profile_pic: '',
    date_of_joining: '', role: '', designation: '', reporting_person: '', status: 'active', availability: '', prev_employer: '', allow_exclusion: false,
    dob: '', blood_group: '', nationality: '', marital_status: '', address_uae: '', home_country_contact: '', personal_email: '',
    emergency_name: '', emergency_number: '', emergency_relation: '',
    passport_number: '', passport_expiry: '', visa_number: '', visa_expiry: '', visa_type: '',
    education: '', bank_name: '', ifsc: '', iban: '', bank_account: ''
  });
  const [open, setOpen] = useState({
    basic: true, employment: false, personal: false, emergency: false, id: false, education: false, payroll: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!user || !(user.is_admin || user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'master')) {
    return <div className="p-8 text-center text-red-500">Access denied. Admins only.</div>;
  }

  const required = [
    { key: 'first_name', label: 'First Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'password', label: 'Password' },
    { key: 'designation', label: 'Designation' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    for (const r of required) {
      if (!form[r.key]) {
        setError(`Missing required: ${r.label}`);
        return;
      }
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/team/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create user');
      setLoading(false);
      setSuccess(true);
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="p-8 w-full min-h-screen bg-white flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-8 w-full text-left">Add New User</h1>
      <form className="space-y-6 w-full" onSubmit={handleSubmit}>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <Section title="Basic Info" open={open.basic} onToggle={() => setOpen(o => ({ ...o, basic: !o.basic }))} className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>First Name *</Label><Input name="first_name" value={form.first_name} onChange={handleChange} required /></div>
            <div><Label>Last Name</Label><Input name="last_name" value={form.last_name} onChange={handleChange} /></div>
            <div><Label>Phone *</Label><Input name="phone" value={form.phone} onChange={handleChange} required /></div>
            <div><Label>Alternate Contact</Label><Input name="alt_contact" value={form.alt_contact} onChange={handleChange} /></div>
            <div><Label>Email *</Label><Input name="email" value={form.email} onChange={handleChange} required /></div>
            <div><Label>Password *</Label><Input name="password" type="password" value={form.password} onChange={handleChange} required /></div>
            <div><Label>Profile Picture URL</Label><Input name="profile_pic" value={form.profile_pic} onChange={handleChange} placeholder="https://..." /></div>
          </div>
        </Section>
        <Section title="Employment Info" open={open.employment} onToggle={() => setOpen(o => ({ ...o, employment: !o.employment }))} className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Date of Joining</Label><Input name="date_of_joining" type="date" value={form.date_of_joining} onChange={handleChange} /></div>
            <div><Label>Role</Label><Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}><SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger><SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Designation *</Label><Select value={form.designation} onValueChange={v => setForm(f => ({ ...f, designation: v }))}><SelectTrigger><SelectValue placeholder="Select Designation" /></SelectTrigger><SelectContent>{DESIGNATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Reporting Person</Label><Input name="reporting_person" value={form.reporting_person} onChange={handleChange} /></div>
            <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
            <div><Label>Availability</Label><Input name="availability" value={form.availability} onChange={handleChange} /></div>
            <div><Label>Previous Employer</Label><Input name="prev_employer" value={form.prev_employer} onChange={handleChange} /></div>
            <div><Label><input type="checkbox" name="allow_exclusion" checked={form.allow_exclusion} onChange={handleChange} /> Allow exclusion list</Label></div>
          </div>
        </Section>
        <Section title="Personal Info" open={open.personal} onToggle={() => setOpen(o => ({ ...o, personal: !o.personal }))} className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>DOB</Label><Input name="dob" type="date" value={form.dob} onChange={handleChange} /></div>
            <div><Label>Blood Group</Label><Input name="blood_group" value={form.blood_group} onChange={handleChange} /></div>
            <div><Label>Nationality</Label><Input name="nationality" value={form.nationality} onChange={handleChange} /></div>
            <div><Label>Marital Status</Label><Select value={form.marital_status} onValueChange={v => setForm(f => ({ ...f, marital_status: v }))}><SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="bachelor">Bachelor</SelectItem><SelectItem value="married">Married</SelectItem></SelectContent></Select></div>
            <div><Label>Current Address in UAE</Label><Input name="address_uae" value={form.address_uae} onChange={handleChange} /></div>
            <div><Label>Home Country Contact</Label><Input name="home_country_contact" value={form.home_country_contact} onChange={handleChange} /></div>
            <div><Label>Personal Email</Label><Input name="personal_email" value={form.personal_email} onChange={handleChange} /></div>
          </div>
        </Section>
        <Section title="Emergency Contact" open={open.emergency} onToggle={() => setOpen(o => ({ ...o, emergency: !o.emergency }))} className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Emergency Name</Label><Input name="emergency_name" value={form.emergency_name} onChange={handleChange} /></div>
            <div><Label>Emergency Number</Label><Input name="emergency_number" value={form.emergency_number} onChange={handleChange} /></div>
            <div><Label>Relationship</Label><Input name="emergency_relation" value={form.emergency_relation} onChange={handleChange} /></div>
          </div>
        </Section>
        <Section title="Identification" open={open.id} onToggle={() => setOpen(o => ({ ...o, id: !o.id }))} className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Passport Number</Label><Input name="passport_number" value={form.passport_number} onChange={handleChange} /></div>
            <div><Label>Passport Expiry</Label><Input name="passport_expiry" type="date" value={form.passport_expiry} onChange={handleChange} /></div>
            <div><Label>Visa Number (EID)</Label><Input name="visa_number" value={form.visa_number} onChange={handleChange} /></div>
            <div><Label>Visa Expiry</Label><Input name="visa_expiry" type="date" value={form.visa_expiry} onChange={handleChange} /></div>
            <div><Label>Visa Type</Label><Input name="visa_type" value={form.visa_type} onChange={handleChange} /></div>
          </div>
        </Section>
        <Section title="Education" open={open.education} onToggle={() => setOpen(o => ({ ...o, education: !o.education }))} className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Education</Label><Select value={form.education} onValueChange={v => setForm(f => ({ ...f, education: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="highschool">Highschool</SelectItem><SelectItem value="undergraduate">Undergraduate</SelectItem><SelectItem value="masters">Masters</SelectItem><SelectItem value="phd">PHD</SelectItem></SelectContent></Select></div>
          </div>
        </Section>
        <Section title="Payroll Details" open={open.payroll} onToggle={() => setOpen(o => ({ ...o, payroll: !o.payroll }))} className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Bank Name</Label><Input name="bank_name" value={form.bank_name} onChange={handleChange} /></div>
            <div><Label>IFSC Code</Label><Input name="ifsc" value={form.ifsc} onChange={handleChange} /></div>
            <div><Label>IBAN</Label><Input name="iban" value={form.iban} onChange={handleChange} /></div>
            <div><Label>Bank Account Number</Label><Input name="bank_account" value={form.bank_account} onChange={handleChange} /></div>
          </div>
        </Section>
        <div className="flex justify-end mt-4">
          <Button type="submit" className="bg-black text-white" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</Button>
        </div>
      </form>
    </div>
  );
} 