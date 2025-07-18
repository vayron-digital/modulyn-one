import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { getCurrencyDisplay } from '../../utils/currency';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { useCurrencyStore, AVAILABLE_CURRENCIES } from '../../utils/currency';
import { supabase } from '../../lib/supabase';
import { Camera, Save } from 'lucide-react';
import Cropper from 'react-easy-crop';
import FullScreenLoader from '../../components/FullScreenLoader';
import { useLocation } from 'react-router-dom';

interface UserSettings {
  full_name: string;
  email: string;
  phone: string;
  profile_image: string;
  currency: string;
  timezone: string;
  secondary_currencies: string[];
}

const DEFAULT_SETTINGS: UserSettings = {
  full_name: '',
  email: '',
  phone: '',
  profile_image: '',
  currency: 'AED',
  timezone: 'UTC',
  secondary_currencies: ['USD', 'GBP', 'EUR']
};

const CURRENCY_COUNTRY_MAP: Record<string, string> = {
  USD: 'United States',
  AED: 'United Arab Emirates',
  INR: 'India',
  GBP: 'United Kingdom',
  EUR: 'European Union',
  RUB: 'Russia',
  SAR: 'Saudi Arabia',
  CNY: 'China',
  CAD: 'Canada',
  TRY: 'Turkey',
  PKR: 'Pakistan',
  KWD: 'Kuwait',
  LBP: 'Lebanon',
  IRR: 'Iran',
  ZAR: 'South Africa',
};

const Settings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const setCurrency = useCurrencyStore(state => state.setCurrency);
  const setSecondaryCurrenciesStore = useCurrencyStore(state => state.setSecondaryCurrencies);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (user?.id) {
      fetchProfileAndSettings();
    }
  }, [user?.id, location.pathname]);

  useEffect(() => {
    if (settings.currency) setCurrency(settings.currency);
    if (settings.secondary_currencies) setSecondaryCurrenciesStore(settings.secondary_currencies);
  }, [settings.currency, settings.secondary_currencies]);

  const fetchProfileAndSettings = async () => {
    try {
      setLoading(true);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email, phone, profile_image_url')
        .eq('id', user?.id)
        .single();
      if (profileError) throw profileError;

      const { data: userSettings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;

      setSettings({
        ...DEFAULT_SETTINGS,
        ...userSettings,
        ...profile,
        profile_image_url: userSettings?.profile_image_url || '',
        secondary_currencies: userSettings?.secondary_currencies || DEFAULT_SETTINGS.secondary_currencies,
        currency: userSettings?.currency || DEFAULT_SETTINGS.currency
      });
      setProfileImageUrl(userSettings?.profile_image_url || '');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (updates: Partial<UserSettings>) => {
    try {
      setLoading(true);
      const profileUpdates: any = {};
      const settingsUpdates: any = {};
      if ('full_name' in updates) profileUpdates.full_name = updates.full_name;
      if ('email' in updates) profileUpdates.email = updates.email;
      if ('phone' in updates) profileUpdates.phone = updates.phone;
      if ('profile_image' in updates) profileUpdates.profile_image_url = updates.profile_image;
      Object.keys(updates).forEach((key) => {
        if (!['full_name', 'email', 'phone', 'profile_image', 'profile_image_url'].includes(key)) {
          settingsUpdates[key] = (updates as any)[key];
        }
      });
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user?.id);
        if (profileError) throw profileError;
      }
      if (Object.keys(settingsUpdates).length > 0) {
        const { error: settingsError } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user?.id,
            ...settingsUpdates,
            updated_at: new Date().toISOString(),
            secondary_currencies: updates.secondary_currencies ?? settings.secondary_currencies,
            currency: updates.currency ?? settings.currency
          });
        if (settingsError) throw settingsError;
      }
      setSettings(prev => ({ ...prev, ...updates }));
      showToast('Settings saved successfully', 'success');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: imageData } = await supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      await handleSaveSettings({ profile_image: fileName });
      setProfileImageUrl(imageData.publicUrl);
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get cropped image blob
  const getCroppedImg = async (imageSrc, cropPixels) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    ctx.drawImage(
      image,
      cropPixels.x,
      cropPixels.y,
      cropPixels.width,
      cropPixels.height,
      0,
      0,
      cropPixels.width,
      cropPixels.height
    );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  // Helper to create image
  function createImage(url) {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', error => reject(error));
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = url;
    });
  }

  // When user selects a new image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSelectedImage(ev.target.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // When user confirms crop
  const handleCropSave = async () => {
    const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels);
    if (!croppedBlob || !user?.id) return;
    setLoading(true);
    try {
      // Convert Blob to File
      const fileName = `profile_${user.id}_${Date.now()}.jpg`;
      const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, croppedFile, { upsert: true, contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);
      const publicUrl = publicUrlData?.publicUrl;
      if (!publicUrl) throw new Error('Could not get public URL for image');
      // Update only in user_settings
      await supabase
        .from('user_settings')
        .update({ profile_image_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      setProfileImageUrl(publicUrl);
      setSettings(prev => ({ ...prev, profile_image_url: publicUrl }));
      showToast('Profile photo updated!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to upload profile photo', 'error');
    } finally {
      setLoading(false);
      setCropModalOpen(false);
      setSelectedImage(null);
    }
  };

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <img
                src={profileImageUrl || '/default-avatar.png'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border"
              />
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleImageChange}
              />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={settings.full_name || ""}
                  onChange={e => setSettings(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email || ""}
                  onChange={e => setSettings(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone || ""}
                  onChange={e => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currency">Primary Currency</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary currency" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Secondary Currencies</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                {AVAILABLE_CURRENCIES.map((currency) => (
                  <div key={currency} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`currency-${currency}`}
                      checked={settings.secondary_currencies?.includes(currency) || false}
                      onChange={(e) => {
                        const newCurrencies = e.target.checked
                          ? [...(settings.secondary_currencies || []), currency]
                          : (settings.secondary_currencies || []).filter(c => c !== currency);
                        setSettings(prev => ({ ...prev, secondary_currencies: newCurrencies }));
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor={`currency-${currency}`} className="text-sm">
                      {currency} - {CURRENCY_COUNTRY_MAP[currency] || currency}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timezone Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Timezone Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT+1)</SelectItem>
                  <SelectItem value="America/New_York">New York (GMT-4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cropper Modal */}
      <DialogRoot open={cropModalOpen} onOpenChange={setCropModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop Profile Photo</DialogTitle>
            <DialogDescription>Drag and zoom to crop your photo. Only a square crop is allowed.</DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-80 bg-gray-100">
            {selectedImage && (
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
              />
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setCropModalOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleCropSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={() => handleSaveSettings(settings)} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default Settings; 