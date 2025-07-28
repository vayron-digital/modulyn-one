import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { RotateCcw, RotateCw, ZoomIn, ZoomOut, Check, X, Download } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (croppedImage: File) => void;
  imageFile: File | null;
  aspectRatio?: number;
  title?: string;
  description?: string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  imageFile,
  aspectRatio = 1,
  title = "Crop Profile Image",
  description = "Adjust your image to create the perfect profile picture"
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  // Create image URL when file changes
  React.useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CropArea) => {
    console.log('onCropComplete called with:', croppedAreaPixels);
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async (): Promise<File> => {
    if (!imageUrl || !croppedAreaPixels) {
      throw new Error('No image or crop area available');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    const image = new Image();
    image.src = imageUrl;

    return new Promise((resolve, reject) => {
      image.onload = () => {
        // Calculate the size of the cropped image
        const maxSize = 400; // Maximum size for profile image
        const cropWidth = croppedAreaPixels.width;
        const cropHeight = croppedAreaPixels.height;
        
        // Calculate scale to fit within maxSize while maintaining aspect ratio
        const scale = Math.min(maxSize / cropWidth, maxSize / cropHeight);
        const finalWidth = Math.round(cropWidth * scale);
        const finalHeight = Math.round(cropHeight * scale);

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        // Apply rotation and crop
        ctx.save();
        
        // Move to center of canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        // Apply rotation
        ctx.rotate((rotation * Math.PI) / 180);
        
        // Apply zoom
        ctx.scale(zoom, zoom);
        
        // Draw the cropped image
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          -finalWidth / (2 * zoom),
          -finalHeight / (2 * zoom),
          finalWidth / zoom,
          finalHeight / zoom
        );
        
        ctx.restore();

        // Convert to blob and then to file
        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File([blob], imageFile?.name || 'cropped-image.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(croppedFile);
          } else {
            reject(new Error('Failed to create cropped image'));
          }
        }, 'image/jpeg', 0.9);
      };

      image.onerror = () => reject(new Error('Failed to load image'));
    });
  };

  const handleConfirm = async () => {
    try {
      setIsProcessing(true);
      const croppedImage = await createCroppedImage();
      onConfirm(croppedImage);
      onClose();
    } catch (error) {
      console.error('Error creating cropped image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  if (!isOpen || !imageFile || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden relative z-[10000]">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">
            {/* Crop Area */}
            <div className="flex-1 relative bg-gray-100 dark:bg-gray-900 min-h-[400px] lg:min-h-[500px]">
              <Cropper
                image={imageUrl}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={true}
                objectFit="contain"
                style={{
                  containerStyle: {
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#f3f4f6',
                  },
                  cropAreaStyle: {
                    border: '2px solid #3b82f6',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                  },
                }}
              />
            </div>

            {/* Controls */}
            <div className="w-full lg:w-80 p-6 border-t lg:border-t-0 lg:border-l bg-gray-50 dark:bg-gray-800">
              <div className="space-y-6">
                {/* Zoom Control */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Zoom ({Math.round(zoom * 100)}%)
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.5}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Slider
                      value={[zoom]}
                      onValueChange={([value]) => setZoom(value)}
                      min={0.5}
                      max={3}
                      step={0.1}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Rotation Controls */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Rotation ({rotation}°)
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRotateLeft}
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Left
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRotateRight}
                      className="flex-1"
                    >
                      <RotateCw className="h-4 w-4 mr-1" />
                      Right
                    </Button>
                  </div>
                </div>

                {/* Reset Button */}
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      console.log('ImageCropModal: Confirm button clicked');
                      console.log('croppedAreaPixels:', croppedAreaPixels);
                      handleConfirm();
                    }}
                    disabled={isProcessing || !croppedAreaPixels}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Confirm
                      </>
                    )}
                  </Button>
                </div>

                {/* Preview Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  <p>Final image will be optimized to 400x400px</p>
                  <p>Format: JPEG, Quality: 90%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageCropModal; 