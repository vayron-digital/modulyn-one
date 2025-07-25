import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Play, 
  Pause, 
  Save, 
  Copy, 
  Download, 
  Upload,
  Zap,
  Target,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  CheckSquare,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
  RefreshCw,
  Share2,
  MoreHorizontal,
  Filter,
  Search,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Building,
  Home,
  MapPin,
  Globe,
  Wifi,
  Battery,
  Wrench,
  Shield,
  Lock,
  Unlock,
  Bell,
  BellOff,
  Star,
  StarOff,
  Heart,
  HeartOff,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Activity,
  Award,
  Trophy,
  Medal,
  Crown,
  Sparkles,
  Rocket,
  Lightning,
  Fire,
  Ice,
  Water,
  Earth,
  Wind,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudDrizzle,
  CloudHail,
  CloudSleet,
  CloudHaze,
  CloudMist,
  CloudSmog,
  CloudDust,
  CloudAsh,
  CloudSmoke,
  CloudFog2,
  CloudHaze2,
  CloudMist2,
  CloudSmog2,
  CloudDust2,
  CloudAsh2,
  CloudSmoke2,
  CloudFog3,
  CloudHaze3,
  CloudMist3,
  CloudSmog3,
  CloudDust3,
  CloudAsh3,
  CloudSmoke3,
  CloudFog4,
  CloudHaze4,
  CloudMist4,
  CloudSmog4,
  CloudDust4,
  CloudAsh4,
  CloudSmoke4,
  CloudFog5,
  CloudHaze5,
  CloudMist5,
  CloudSmog5,
  CloudDust5,
  CloudAsh5,
  CloudSmoke5,
  CloudFog6,
  CloudHaze6,
  CloudMist6,
  CloudSmog6,
  CloudDust6,
  CloudAsh6,
  CloudSmoke6,
  CloudFog7,
  CloudHaze7,
  CloudMist7,
  CloudSmog7,
  CloudDust7,
  CloudAsh7,
  CloudSmoke7,
  CloudFog8,
  CloudHaze8,
  CloudMist8,
  CloudSmog8,
  CloudDust8,
  CloudAsh8,
  CloudSmoke8,
  CloudFog9,
  CloudHaze9,
  CloudMist9,
  CloudSmog9,
  CloudDust9,
  CloudAsh9,
  CloudSmoke9,
  CloudFog10,
  CloudHaze10,
  CloudMist10,
  CloudSmog10,
  CloudDust10,
  CloudAsh10,
  CloudSmoke10,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  title: string;
  description: string;
  config: Record<string, any>;
  position: number;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const WorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');

  const stepTypes = [
    {
      type: 'trigger',
      title: 'Trigger',
      description: 'When something happens',
      icon: Zap,
      color: 'bg-blue-100 text-blue-600',
      examples: [
        'New lead created',
        'Lead status changed',
        'Email opened',
        'Website visit',
        'Form submitted'
      ]
    },
    {
      type: 'condition',
      title: 'Condition',
      description: 'If this is true',
      icon: Target,
      color: 'bg-green-100 text-green-600',
      examples: [
        'Lead score > 80',
        'Budget > $100k',
        'Source is website',
        'Location is Dubai',
        'Has company'
      ]
    },
    {
      type: 'action',
      title: 'Action',
      description: 'Do something',
      icon: Play,
      color: 'bg-purple-100 text-purple-600',
      examples: [
        'Send email',
        'Create task',
        'Assign agent',
        'Update status',
        'Send notification'
      ]
    },
    {
      type: 'delay',
      title: 'Delay',
      description: 'Wait for a while',
      icon: Clock,
      color: 'bg-orange-100 text-orange-600',
      examples: [
        'Wait 24 hours',
        'Wait 3 days',
        'Wait until Monday',
        'Wait until 9 AM',
        'Wait for response'
      ]
    }
  ];

  const renderStepCard = (step: WorkflowStep) => {
    const stepType = stepTypes.find(t => t.type === step.type);
    const Icon = stepType?.icon || Settings;

    return (
      <Card key={step.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn("p-2 rounded-full", stepType?.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-medium">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStepLibrary = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Step Library</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stepTypes.map((stepType) => {
          const Icon = stepType.icon;
          return (
            <Card key={stepType.type} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={cn("p-2 rounded-full", stepType.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{stepType.title}</h4>
                    <p className="text-sm text-gray-600">{stepType.description}</p>
                    <div className="mt-2">
                      {stepType.examples.slice(0, 2).map((example, index) => (
                        <Badge key={index} variant="secondary" className="mr-1 mb-1 text-xs">
                          {example}
                        </Badge>
                      ))}
                      {stepType.examples.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{stepType.examples.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderWorkflowCanvas = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Workflow Canvas</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm">
            <Play className="h-4 w-4 mr-2" />
            Test
          </Button>
          <Button size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 min-h-[400px] border-2 border-dashed border-gray-300">
        <div className="text-center py-12">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Workflow</h4>
          <p className="text-gray-600 mb-4">Drag and drop steps from the library to create your automation</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add First Step
          </Button>
        </div>
      </div>
    </div>
  );

  const renderWorkflowList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Workflows</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Workflow
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">{workflow.name}</h4>
                  <p className="text-sm text-gray-600">{workflow.description}</p>
                </div>
                <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                  {workflow.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{workflow.steps.length} steps</span>
                <span>{new Date(workflow.updatedAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center space-x-2 mt-3">
                <Button variant="ghost" size="sm">
                  <Play className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {workflows.length === 0 && (
        <div className="text-center py-12">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Workflows Yet</h4>
          <p className="text-gray-600 mb-4">Create your first automation workflow to streamline your lead management</p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Workflow Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15%
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Executions Today</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Play className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">94.2%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-gray-900">47h</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12h
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <BarChart3 className="h-12 w-12" />
              <span className="ml-2">Performance chart will be displayed here</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Active Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Lead Follow-up', executions: 342, success: 98.5 },
                { name: 'Welcome Email', executions: 289, success: 99.2 },
                { name: 'Status Update', executions: 156, success: 95.8 },
                { name: 'Task Assignment', executions: 134, success: 97.1 },
              ].map((workflow, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{workflow.name}</p>
                    <p className="text-sm text-gray-600">{workflow.executions} executions</p>
                  </div>
                  <Badge variant="default">{workflow.success}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflow Automation</h1>
            <p className="text-gray-600 mt-1">Build powerful automations to streamline your lead management</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
            <TabsTrigger value="library">Step Library</TabsTrigger>
            <TabsTrigger value="workflows">My Workflows</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {renderWorkflowCanvas()}
              </div>
              <div>
                {renderStepLibrary()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library" className="mt-6">
            {renderStepLibrary()}
          </TabsContent>

          <TabsContent value="workflows" className="mt-6">
            {renderWorkflowList()}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            {renderAnalytics()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkflowBuilder; 