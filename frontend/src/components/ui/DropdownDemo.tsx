import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { SelectWithSearch } from './select';
import { DropdownWithSearch } from './dropdown';
import { Button } from './button';
import { 
  User, 
  Users, 
  Shield, 
  Building, 
  Globe, 
  Mail, 
  Phone, 
  Calendar,
  DollarSign,
  MapPin,
  Home,
  Car,
  Briefcase,
  Heart,
  Star,
  Zap,
  Rocket,
  Search,
  Check,
  X
} from 'lucide-react';

const DropdownDemo = () => {
  const [selectedRole, setSelectedRole] = React.useState('');
  const [selectedCountry, setSelectedCountry] = React.useState('');
  const [selectedAction, setSelectedAction] = React.useState('');

  const roles = [
    { value: 'agent', label: 'Agent', description: 'Can manage leads and tasks', icon: <User className="h-4 w-4" /> },
    { value: 'team_leader', label: 'Team Leader', description: 'Can manage team members and reports', icon: <Users className="h-4 w-4" /> },
    { value: 'admin', label: 'Admin', description: 'Full system access and management', icon: <Shield className="h-4 w-4" /> },
    { value: 'manager', label: 'Manager', description: 'Can manage projects and budgets', icon: <Building className="h-4 w-4" /> }
  ];

  const countries = [
    { value: 'us', label: 'United States', description: 'North America', icon: <Globe className="h-4 w-4" /> },
    { value: 'ae', label: 'United Arab Emirates', description: 'Middle East', icon: <Globe className="h-4 w-4" /> },
    { value: 'uk', label: 'United Kingdom', description: 'Europe', icon: <Globe className="h-4 w-4" /> },
    { value: 'in', label: 'India', description: 'Asia', icon: <Globe className="h-4 w-4" /> },
    { value: 'ca', label: 'Canada', description: 'North America', icon: <Globe className="h-4 w-4" /> },
    { value: 'au', label: 'Australia', description: 'Oceania', icon: <Globe className="h-4 w-4" /> }
  ];

  const actions = [
    { value: 'call', label: 'Call Lead', description: 'Make a phone call', icon: <Phone className="h-4 w-4" />, shortcut: '⌘C' },
    { value: 'email', label: 'Send Email', description: 'Send an email message', icon: <Mail className="h-4 w-4" />, shortcut: '⌘E' },
    { value: 'meeting', label: 'Schedule Meeting', description: 'Book a meeting', icon: <Calendar className="h-4 w-4" />, shortcut: '⌘M' },
    { value: 'quote', label: 'Send Quote', description: 'Generate and send quote', icon: <DollarSign className="h-4 w-4" />, shortcut: '⌘Q' },
    { value: 'visit', label: 'Site Visit', description: 'Arrange property visit', icon: <MapPin className="h-4 w-4" />, shortcut: '⌘V' }
  ];

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment', description: 'Residential apartment', icon: <Home className="h-4 w-4" /> },
    { value: 'villa', label: 'Villa', description: 'Luxury villa', icon: <Home className="h-4 w-4" /> },
    { value: 'office', label: 'Office', description: 'Commercial office space', icon: <Building className="h-4 w-4" /> },
    { value: 'warehouse', label: 'Warehouse', description: 'Industrial warehouse', icon: <Briefcase className="h-4 w-4" /> },
    { value: 'parking', label: 'Parking', description: 'Parking space', icon: <Car className="h-4 w-4" /> }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Enhanced Dropdown Components
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Smooth animations, search functionality, and better UX
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SelectWithSearch Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              SelectWithSearch Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">User Role</label>
              <SelectWithSearch
                value={selectedRole}
                onValueChange={setSelectedRole}
                placeholder="Select user role"
                searchPlaceholder="Search roles..."
                items={roles}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Country</label>
              <SelectWithSearch
                value={selectedCountry}
                onValueChange={setSelectedCountry}
                placeholder="Select country"
                searchPlaceholder="Search countries..."
                items={countries}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Property Type</label>
              <SelectWithSearch
                placeholder="Select property type"
                searchPlaceholder="Search property types..."
                items={propertyTypes}
              />
            </div>
          </CardContent>
        </Card>

        {/* DropdownWithSearch Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              DropdownWithSearch Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Quick Actions</label>
              <DropdownWithSearch
                searchPlaceholder="Search actions..."
                items={actions}
                onSelect={(value) => {
                  setSelectedAction(value);
                  console.log('Selected action:', value);
                }}
              >
                <Button variant="outline" className="w-full justify-between">
                  Choose Action
                  <span className="text-xs text-gray-500">⌘K</span>
                </Button>
              </DropdownWithSearch>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Lead Status</label>
              <DropdownWithSearch
                searchPlaceholder="Search statuses..."
                items={[
                  { value: 'new', label: 'New Lead', description: 'Recently added lead', icon: <Star className="h-4 w-4" /> },
                  { value: 'contacted', label: 'Contacted', description: 'Initial contact made', icon: <Phone className="h-4 w-4" /> },
                  { value: 'qualified', label: 'Qualified', description: 'Lead meets criteria', icon: <Heart className="h-4 w-4" /> },
                  { value: 'proposal', label: 'Proposal Sent', description: 'Quote or proposal sent', icon: <DollarSign className="h-4 w-4" /> },
                  { value: 'negotiation', label: 'Negotiation', description: 'In negotiation phase', icon: <Users className="h-4 w-4" /> },
                  { value: 'closed', label: 'Closed Won', description: 'Deal successfully closed', icon: <Check className="h-4 w-4" /> },
                  { value: 'lost', label: 'Closed Lost', description: 'Deal lost to competition', icon: <X className="h-4 w-4" /> }
                ]}
                onSelect={(value) => console.log('Selected status:', value)}
              >
                <Button variant="outline" className="w-full justify-between">
                  Update Status
                </Button>
              </DropdownWithSearch>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Search className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold mb-1">Search Functionality</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quickly find options with real-time search</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold mb-1">Smooth Animations</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Beautiful transitions and micro-interactions</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Star className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-semibold mb-1">Rich Content</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Icons, descriptions, and keyboard shortcuts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DropdownDemo; 