import { supabase } from '../lib/supabase';

export interface StorageTestResult {
  bucket: string;
  status: 'success' | 'error';
  message: string;
  details?: any;
}

export interface StorageBucketConfig {
  name: string;
  description: string;
  expectedFileTypes: string[];
  maxFileSize: number;
}

export const STORAGE_BUCKETS: StorageBucketConfig[] = [
  {
    name: 'profile-images',
    description: 'User profile pictures and avatars',
    expectedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },
  {
    name: 'property-images',
    description: 'Property listing images and photos',
    expectedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 20 * 1024 * 1024 // 20MB
  },
  {
    name: 'documents',
    description: 'General document uploads and project files',
    expectedFileTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  {
    name: 'attachments',
    description: 'Lead attachments and files',
    expectedFileTypes: ['*/*'], // All file types
    maxFileSize: 25 * 1024 * 1024 // 25MB
  },
  {
    name: 'brochures',
    description: 'Property brochures, developer logos, marketing materials',
    expectedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxFileSize: 30 * 1024 * 1024 // 30MB
  }
];

export async function testStorageBuckets(): Promise<StorageTestResult[]> {
  const results: StorageTestResult[] = [];
  
  for (const bucket of STORAGE_BUCKETS) {
    try {
      console.log(`Testing bucket: ${bucket.name}`);
      
      // Test 1: Check if bucket exists and is accessible
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucket.name);
      
      if (bucketError) {
        results.push({
          bucket: bucket.name,
          status: 'error',
          message: `Bucket not accessible: ${bucketError.message}`,
          details: bucketError
        });
        continue;
      }
      
      // Test 2: Check bucket configuration
      if (!bucketData) {
        results.push({
          bucket: bucket.name,
          status: 'error',
          message: 'Bucket data not returned',
          details: { bucketData }
        });
        continue;
      }
      
      // Test 3: Test list operation
      const { data: listData, error: listError } = await supabase.storage
        .from(bucket.name)
        .list('', { limit: 1 });
      
      if (listError) {
        results.push({
          bucket: bucket.name,
          status: 'error',
          message: `List operation failed: ${listError.message}`,
          details: listError
        });
        continue;
      }
      
      // Test 4: Test upload operation with a small test file
      const testFileName = `test-${Date.now()}.txt`;
      const testContent = 'Storage test file - can be deleted';
      const testFile = new File([testContent], testFileName, { type: 'text/plain' });
      
      const { error: uploadError } = await supabase.storage
        .from(bucket.name)
        .upload(testFileName, testFile);
      
      if (uploadError) {
        results.push({
          bucket: bucket.name,
          status: 'error',
          message: `Upload test failed: ${uploadError.message}`,
          details: uploadError
        });
        continue;
      }
      
      // Test 5: Test getPublicUrl operation
      const { data: urlData } = supabase.storage
        .from(bucket.name)
        .getPublicUrl(testFileName);
      
      if (!urlData?.publicUrl) {
        results.push({
          bucket: bucket.name,
          status: 'error',
          message: `Public URL generation failed: No public URL returned`,
          details: { urlData }
        });
        continue;
      }
      
      // Test 6: Test delete operation (cleanup)
      const { error: deleteError } = await supabase.storage
        .from(bucket.name)
        .remove([testFileName]);
      
      if (deleteError) {
        results.push({
          bucket: bucket.name,
          status: 'error',
          message: `Delete test failed: ${deleteError.message}`,
          details: deleteError
        });
        continue;
      }
      
      // All tests passed
      results.push({
        bucket: bucket.name,
        status: 'success',
        message: `Bucket ${bucket.name} is working correctly`,
        details: {
          bucketConfig: bucketData,
          publicUrl: urlData.publicUrl
        }
      });
      
    } catch (error: any) {
      results.push({
        bucket: bucket.name,
        status: 'error',
        message: `Unexpected error: ${error.message}`,
        details: error
      });
    }
  }
  
  return results;
}

export function generateStorageReport(results: StorageTestResult[]): string {
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'error');
  
  let report = `# Storage Bucket Test Report\n\n`;
  report += `**Summary:** ${successful.length}/${results.length} buckets working correctly\n\n`;
  
  if (successful.length > 0) {
    report += `## ✅ Working Buckets\n`;
    successful.forEach(result => {
      report += `- **${result.bucket}**: ${result.message}\n`;
    });
    report += `\n`;
  }
  
  if (failed.length > 0) {
    report += `## ❌ Failed Buckets\n`;
    failed.forEach(result => {
      report += `- **${result.bucket}**: ${result.message}\n`;
      if (result.details) {
        report += `  - Details: ${JSON.stringify(result.details, null, 2)}\n`;
      }
    });
    report += `\n`;
  }
  
  report += `## 📋 Required Buckets\n`;
  STORAGE_BUCKETS.forEach(bucket => {
    const result = results.find(r => r.bucket === bucket.name);
    const status = result?.status === 'success' ? '✅' : '❌';
    report += `${status} **${bucket.name}** - ${bucket.description}\n`;
    report += `   - File types: ${bucket.expectedFileTypes.join(', ')}\n`;
    report += `   - Max size: ${(bucket.maxFileSize / (1024 * 1024)).toFixed(0)}MB\n\n`;
  });
  
  return report;
}

export async function validateFileUpload(
  bucket: string, 
  file: File, 
  filePath: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // Check if bucket exists
    const bucketConfig = STORAGE_BUCKETS.find(b => b.name === bucket);
    if (!bucketConfig) {
      return { valid: false, error: `Unknown bucket: ${bucket}` };
    }
    
    // Check file size
    if (file.size > bucketConfig.maxFileSize) {
      return { 
        valid: false, 
        error: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds limit (${(bucketConfig.maxFileSize / (1024 * 1024)).toFixed(0)}MB)` 
      };
    }
    
    // Check file type (if not wildcard)
    if (!bucketConfig.expectedFileTypes.includes('*/*')) {
      const isValidType = bucketConfig.expectedFileTypes.some(type => {
        if (type === '*/*') return true;
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });
      
      if (!isValidType) {
        return { 
          valid: false, 
          error: `File type ${file.type} not allowed. Allowed types: ${bucketConfig.expectedFileTypes.join(', ')}` 
        };
      }
    }
    
    // Check if file path is valid
    if (!filePath || filePath.trim() === '') {
      return { valid: false, error: 'File path is required' };
    }
    
    return { valid: true };
    
  } catch (error: any) {
    return { valid: false, error: `Validation error: ${error.message}` };
  }
} 