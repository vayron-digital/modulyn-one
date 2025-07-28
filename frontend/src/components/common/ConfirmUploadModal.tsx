import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Check, X, Upload, AlertCircle } from 'lucide-react';

interface ConfirmUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  imageUrl: string;
  fileName: string;
  fileSize: string;
  isUploading?: boolean;
}

const ConfirmUploadModal: React.FC<ConfirmUploadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  imageUrl,
  fileName,
  fileSize,
  isUploading = false
}) => {
  console.log('ConfirmUploadModal render:', { isOpen, fileName, fileSize, isUploading });
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 relative z-[10000]">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Upload className="h-5 w-5 text-blue-500" />
            Confirm Upload
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Image Preview */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700 shadow-lg">
              <img
                src={imageUrl}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* File Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">File name:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate ml-2">
                {fileName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">File size:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {fileSize}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                400x400px
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">This will replace your current profile image</p>
                <p className="mt-1">The previous image will be automatically deleted from storage.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log('ConfirmUploadModal: Upload button clicked');
                onConfirm();
              }}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </div>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmUploadModal; 