import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';

interface Job {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  result: any;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

const JobsManagement: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchJobs();
    }
  }, [user?.id]);

  const createJob = async (name: string, description: string) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          name,
          description,
          status: 'pending',
          progress: 0,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setJobs(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Job created successfully",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateJobStatus = async (jobId: string, status: Job['status'], progress?: number) => {
    try {
      const updates: any = { status };
      if (progress !== undefined) updates.progress = progress;
      if (status === 'running') updates.started_at = new Date().toISOString();
      if (status === 'completed' || status === 'failed') updates.completed_at = new Date().toISOString();

      const { error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', jobId);

      if (error) throw error;

      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, ...updates } : job
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      setJobs(prev => prev.filter(job => job.id !== jobId));
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jobs Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage background jobs</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => createJob('Data Export', 'Export all leads data to CSV')}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Create Export Job
          </Button>
          <Button
            onClick={() => createJob('System Backup', 'Create system backup')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Create Backup
          </Button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No jobs found</h3>
              <p className="text-gray-500 mb-4">Create your first background job to get started</p>
              <Button onClick={() => createJob('Sample Job', 'This is a sample background job')}>
                Create Sample Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {job.name}
                      </h3>
                      <Badge className={getStatusColor(job.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(job.status)}
                          {job.status}
                        </div>
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {job.description}
                    </p>

                    {/* Progress Bar */}
                    {job.status === 'running' && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}

                    {/* Job Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Created:</span>
                        <br />
                        {formatDate(job.created_at)}
                      </div>
                      {job.started_at && (
                        <div>
                          <span className="font-medium">Started:</span>
                          <br />
                          {formatDate(job.started_at)}
                        </div>
                      )}
                      {job.completed_at && (
                        <div>
                          <span className="font-medium">Completed:</span>
                          <br />
                          {formatDate(job.completed_at)}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Duration:</span>
                        <br />
                        {job.started_at && job.completed_at 
                          ? `${Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000)}s`
                          : job.started_at 
                            ? `${Math.round((Date.now() - new Date(job.started_at).getTime()) / 1000)}s`
                            : '-'
                        }
                      </div>
                    </div>

                    {/* Error Message */}
                    {job.error_message && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          <strong>Error:</strong> {job.error_message}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    {job.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateJobStatus(job.id, 'running')}
                        className="flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Start
                      </Button>
                    )}
                    
                    {job.status === 'running' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateJobStatus(job.id, 'cancelled')}
                          className="flex items-center gap-1"
                        >
                          <XCircle className="h-3 w-3" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateJobStatus(job.id, 'completed', 100)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Complete
                        </Button>
                      </>
                    )}

                    {(job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateJobStatus(job.id, 'pending', 0)}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteJob(job.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default JobsManagement; 