import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { testStorageBuckets, generateStorageReport, StorageTestResult, STORAGE_BUCKETS } from '../../utils/storageTest';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Download, RefreshCw } from 'lucide-react';

export default function StorageTest() {
  const [results, setResults] = useState<StorageTestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string>('');

  const runTests = async () => {
    setLoading(true);
    setResults([]);
    setReport('');
    
    try {
      const testResults = await testStorageBuckets();
      setResults(testResults);
      
      const generatedReport = generateStorageReport(testResults);
      setReport(generatedReport);
      
      console.log('Storage Test Results:', testResults);
      console.log('Generated Report:', generatedReport);
      
    } catch (error) {
      console.error('Storage test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storage-test-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const successfulCount = results.filter(r => r.status === 'success').length;
  const failedCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Storage Bucket Test</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all storage buckets to ensure they're working correctly
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runTests} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {loading ? 'Running Tests...' : 'Run Tests'}
          </Button>
          {report && (
            <Button 
              onClick={downloadReport} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          )}
        </div>
      </div>

      {/* Summary */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">{successfulCount} Working</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium">{failedCount} Failed</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">{STORAGE_BUCKETS.length} Total</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Individual Results */}
          <Card>
            <CardHeader>
              <CardTitle>Bucket Test Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <h3 className="font-medium">{result.bucket}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {result.message}
                      </p>
                    </div>
                  </div>
                  <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                    {result.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Required Buckets */}
          <Card>
            <CardHeader>
              <CardTitle>Required Buckets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {STORAGE_BUCKETS.map((bucket) => {
                const result = results.find(r => r.bucket === bucket.name);
                const status = result?.status === 'success' ? 'success' : result?.status === 'error' ? 'error' : 'pending';
                
                return (
                  <div key={bucket.name} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{bucket.name}</h3>
                      <Badge variant={status === 'success' ? 'default' : status === 'error' ? 'destructive' : 'secondary'}>
                        {status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {bucket.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      <div>File types: {bucket.expectedFileTypes.join(', ')}</div>
                      <div>Max size: {(bucket.maxFileSize / (1024 * 1024)).toFixed(0)}MB</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {failedCount > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <p className="text-red-700 dark:text-red-300">
                {failedCount} bucket{failedCount > 1 ? 's' : ''} failed the test. 
                Please check your Supabase storage configuration and ensure all required buckets are created.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {successfulCount === STORAGE_BUCKETS.length && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-green-700 dark:text-green-300">
                All storage buckets are working correctly! Your file upload functionality should work properly.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Required Supabase Storage Buckets:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li><strong>profile-images</strong> - User profile pictures and avatars</li>
              <li><strong>property-images</strong> - Property listing images and photos</li>
              <li><strong>documents</strong> - General document uploads and project files</li>
              <li><strong>attachments</strong> - Lead attachments and files</li>
              <li><strong>brochures</strong> - Property brochures, developer logos, marketing materials</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Bucket Configuration:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>All buckets should be <strong>public</strong> for read access</li>
              <li>Set appropriate file size limits (10-50MB depending on bucket)</li>
              <li>Configure allowed MIME types based on bucket purpose</li>
              <li>Enable Row Level Security (RLS) policies for write access</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 