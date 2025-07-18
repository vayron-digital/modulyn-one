import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

export default function UploadCalls() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'text/csv') {
        setError('Please upload a CSV file');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Read the file content using FileReader
      const reader = new FileReader();
      
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          } else {
            reject(new Error('Failed to read file content'));
          }
        };
        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };
        reader.readAsText(file);
      });

      const lines = fileContent.split('\n');
      
      // Skip header row and process each line
      const calls = lines.slice(1).map(line => {
        const [phone] = line.split(',').map(item => item.trim());
        return { phone };
      }).filter(call => {
        // Basic phone number validation
        const phoneRegex = /^\+?[\d\s-]{8,}$/;
        return call.phone && phoneRegex.test(call.phone);
      });

      if (calls.length === 0) {
        throw new Error('No valid phone numbers found in the file. Please ensure the file contains phone numbers in the correct format.');
      }

      // Get current user (admin)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw new Error(`Authentication error: ${userError.message}`);
      if (!user) throw new Error('User not authenticated');

      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) throw new Error(`Profile error: ${profileError.message}`);
      if (profile?.role !== 'Administrator') throw new Error('Only administrators can upload phone numbers');

      // Insert calls in batches
      const batchSize = 100;
      let totalInserted = 0;
      let errors: string[] = [];

      for (let i = 0; i < calls.length; i += batchSize) {
        const batch = calls.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('cold_calls')
          .insert(batch.map(call => ({
            phone: call.phone,
            agent_id: user.id,
            created_at: new Date().toISOString()
          })));

        if (insertError) {
          console.error('Insert error:', insertError);
          errors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${insertError.message || 'Unknown error'}`);
        } else {
          totalInserted += batch.length;
        }
      }

      if (errors.length > 0) {
        throw new Error(`Some records failed to upload: ${errors.join('; ')}`);
      }

      setSuccess(`Successfully uploaded ${totalInserted} phone numbers`);
      setFile(null);
    } catch (err) {
      console.error('Error uploading calls:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while uploading calls');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Upload Calls</h1>
          <p className="mt-2 text-sm text-gray-700">
            Upload a CSV file containing phone numbers to add to the cold calling list.
            The file should have one phone number per line.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CSV File
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".csv"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    CSV file with phone numbers (one per line)
                  </p>
                </div>
              </div>
              {file && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected file: {file.name}
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/calls')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 