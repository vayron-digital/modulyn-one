import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  User, 
  Building, 
  MapPin, 
  Tag, 
  Star, 
  DollarSign,
  Edit,
  Save,
  X,
  Plus,
  MessageCircle,
  PhoneCall,
  Video,
  FileText,
  Download,
  Upload,
  Share2,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Zap,
  Heart,
  AlertCircle,
  CheckCircle,
  CheckSquare,
  Clock as ClockIcon,
  Users,
  Globe,
  Home,
  Bed,
  Bath,
  Car,
  Plane,
  Camera,
  Music,
  Gamepad2,
  BookOpen,
  Briefcase,
  GraduationCap,
  Palette,
  Utensils,
  ShoppingBag,
  Wifi,
  Battery,
  Wrench,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Star as StarIcon,
  StarOff,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Settings,
  RefreshCw,
  RotateCcw,
  Copy,
  ExternalLink,
  Link,
  Unlink,
  Maximize,
  Minimize,
  Move,
  GripVertical,
  Trash2,
  Archive,
  ArchiveRestore,
  Flag,
  Bookmark,
  BookmarkPlus,
  BookmarkMinus,
  Heart as HeartIcon,
  HeartOff,
  MessageSquare,
  MessageCircle as MessageCircleIcon,
  Send,
  Reply,
  Forward,
  Quote,
  Code,
  Hash,
  AtSign,
  Percent,
  Infinity,
  Minus,
  Equal,
  Divide,
  Multiply,
  Plus as PlusIcon,
  Minus as MinusIcon,
  X as XIcon,
  Check,
  AlertTriangle,
  Info,
  HelpCircle,
  File,
  FilePlus,
  FileMinus,
  FileX,
  FileCheck,
  FileText as FileTextIcon,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FilePresentation,
  FileDatabase,
  FileJson,
  FileXml,
  FileCsv,
  FilePdf,
  FileWord,
  FileExcel,
  FilePowerpoint,
  FileZip,
  FileRar,
  File7z,
  FileTxt,
  FileMd,
  FileHtml,
  FileCss,
  FileJs,
  FileTs,
  FileJsx,
  FileTsx,
  FileVue,
  FileReact,
  FileAngular,
  FileSvelte,
  FileNext,
  FileNuxt,
  FileLaravel,
  FileDjango,
  FileFlask,
  FileExpress,
  FileKoa,
  FileFastify,
  FileNest,
  FileSpring,
  FileDotnet,
  FilePhp,
  FilePython,
  FileJava,
  FileKotlin,
  FileSwift,
  FileGo,
  FileRust,
  FileCpp,
  FileC,
  FileCsharp,
  FileScala,
  FileRuby,
  FileElixir,
  FileClojure,
  FileHaskell,
  FileErlang,
  FileOcaml,
  FileFsharp,
  FileDart,
  FileR,
  FileMatlab,
  FileJulia,
  FilePerl,
  FileBash,
  FilePowershell,
  FileBatch,
  FileDocker,
  FileKubernetes,
  FileTerraform,
  FileAnsible,
  FileChef,
  FilePuppet,
  FileJenkins,
  FileGitlab,
  FileGithub,
  FileBitbucket,
  FileJira,
  FileConfluence,
  FileSlack,
  FileDiscord,
  FileTeams,
  FileZoom,
  FileSkype,
  FileWhatsapp,
  FileTelegram,
  FileSignal,
  FileWechat,
  FileLine,
  FileViber,
  FileSnapchat,
  FileTiktok,
  FileInstagram,
  FileFacebook,
  FileTwitter,
  FileLinkedin,
  FileYoutube,
  FileTwitch,
  FileReddit,
  FilePinterest,
  FileTumblr,
  FileMedium,
  FileDev,
  FileHashnode,
  FileSubstack,
  FileNewsletter,
  FileBlog,
  FilePortfolio,
  FileResume,
  FileCv,
  FileCoverLetter,
  FileInvoice,
  FileReceipt,
  FileContract,
  FileAgreement,
  FilePolicy,
  FileTerms,
  FilePrivacy,
  FileLicense,
  FileCertificate,
  FileDiploma,
  FileTranscript,
  FileReport,
  FileAnalysis,
  FileResearch,
  FileSurvey,
  FilePoll,
  FileVote,
  FileElection,
  FileReferendum,
  FilePetition,
  FileProposal,
  FilePlan,
  FileStrategy,
  FileRoadmap,
  FileTimeline,
  FileSchedule,
  FileCalendar,
  FileEvent,
  FileMeeting,
  FileConference,
  FileWebinar,
  FileWorkshop,
  FileTraining,
  FileCourse,
  FileLesson,
  FileTutorial,
  FileGuide,
  FileManual,
  FileHandbook,
  FileEncyclopedia,
  FileDictionary,
  FileThesaurus,
  FileGlossary,
  FileIndex,
  FileTable,
  FileChart,
  FileGraph,
  FileDiagram,
  FileFlowchart,
  FileMindmap,
  FileWireframe,
  FileMockup,
  FilePrototype,
  FileDesign,
  FileSketch,
  FileFigma,
  FileAdobe,
  FilePhotoshop,
  FileIllustrator,
  FileIndesign,
  FilePremiere,
  FileAfterEffects,
  FileAudition,
  FileLightroom,
  FileBridge,
  FileDreamweaver,
  FileFlash,
  FileDirector,
  FileCaptivate,
  FilePresenter,
  FileConnect,
  FileAcrobat,
  FileReader,
  FileWriter,
  FileCalc,
  FileImpress,
  FileDraw,
  FileMath,
  FileBase,
  FileCharts,
  FileWeb,
  FileForm,
  FileReport as FileReportIcon,
  FileData,
  FileDatabase as FileDatabaseIcon,
  FileServer,
  FileCloud,
  FileBackup,
  FileSync,
  FileShare,
  FileNetwork,
  FileWifi as FileWifiIcon,
  FileBluetooth,
  FileUsb,
  FileHdmi,
  FileVga,
  FileDvi,
  FileDisplayport,
  FileThunderbolt,
  FileEthernet,
  FileModem,
  FileRouter,
  FileSwitch,
  FileHub,
  FileBridge as FileBridgeIcon,
  FileGateway,
  FileFirewall,
  FileVpn,
  FileProxy,
  FileLoadBalancer,
  FileCache,
  FileCdn,
  FileDns,
  FileDhcp,
  FileNtp,
  FileSmtp,
  FilePop3,
  FileImap,
  FileFtp,
  FileSftp,
  FileScp,
  FileSsh,
  FileTelnet,
  FileHttp,
  FileHttps,
  FileWs,
  FileWss,
  FileMqtt,
  FileCoap,
  FileAmqp,
  FileStomp,
  FileJms,
  FileKafka,
  FileRabbitmq,
  FileRedis,
  FileMemcached,
  FileMongodb,
  FilePostgresql,
  FileMysql,
  FileSqlite,
  FileOracle,
  FileSqlserver,
  FileDb2,
  FileCassandra,
  FileHbase,
  FileNeo4j,
  FileArangodb,
  FileCouchdb,
  FileRethinkdb,
  FileInfluxdb,
  FileTimescaledb,
  FileClickhouse,
  FileSnowflake,
  FileBigquery,
  FileRedshift,
  FileS3,
  FileGcs,
  FileAzure,
  FileDropbox,
  FileOnedrive,
  FileBox,
  FileDrive,
  FileMega,
  FilePcloud,
  FileTresorit,
  FileSync as FileSyncIcon,
  FileBackup as FileBackupIcon,
  FileArchive as FileArchiveIcon,
  FileCompress,
  FileExtract,
  FileZip as FileZipIcon,
  FileUnzip,
  FilePack,
  FileUnpack,
  FileBundle,
  FileUnbundle,
  FileMerge,
  FileSplit,
  FileJoin,
  FileSeparate,
  FileCombine,
  FileDivide,
  FileMultiply,
  FileAdd,
  FileSubtract,
  FileCalculate,
  FileCompute,
  FileProcess,
  FileExecute,
  FileRun,
  FileStart,
  FileStop,
  FilePause,
  FileRestart,
  FileReload,
  FileRefresh,
  FileUpdate,
  FileUpgrade,
  FileDowngrade,
  FileInstall,
  FileUninstall,
  FileSetup,
  FileConfigure,
  FileCustomize,
  FilePersonalize,
  FileTheme,
  FileStyle,
  FileLayout,
  FileTemplate,
  FilePattern,
  FileFramework,
  FileLibrary,
  FileModule,
  FilePackage,
  FilePlugin,
  FileExtension,
  FileAddon,
  FileWidget,
  FileGadget,
  FileTool,
  FileUtility,
  FileApp,
  FileApplication,
  FileProgram,
  FileSoftware,
  FileSystem,
  FileOs,
  FilePlatform,
  FileEnvironment,
  FileRuntime,
  FileCompiler,
  FileInterpreter,
  FileVirtualMachine,
  FileContainer,
  FileImage as FileImageIcon,
  FileSnapshot,
  FileBackup as FileBackupIcon2,
  FileRestore,
  FileRecovery,
  FileRepair,
  FileFix,
  FileDebug,
  FileTest,
  FileValidate,
  FileVerify,
  FileCheck as FileCheckIcon,
  FileAudit,
  FileReview,
  FileApprove,
  FileReject,
  FileAccept,
  FileDecline,
  FileConfirm,
  FileCancel,
  FileSubmit,
  FileSend as FileSendIcon,
  FileReceive,
  FileImport,
  FileExport,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  FileTransfer,
  FileMove as FileMoveIcon,
  FileCopy as FileCopyIcon,
  FilePaste,
  FileCut,
  FileDelete,
  FileRemove,
  FileClear,
  FileEmpty,
  FileReset,
  FileDefault,
  FileOriginal,
  FileModified,
  FileEdited,
  FileDraft,
  FileFinal,
  FilePublished,
  FileUnpublished,
  FilePublic,
  FilePrivate,
  FileSecret,
  FileConfidential,
  FileClassified,
  FileRestricted,
  FileInternal,
  FileExternal,
  FileGuest,
  FileUser,
  FileAdmin,
  FileOwner,
  FileCreator,
  FileAuthor,
  FileContributor,
  FileCollaborator,
  FilePartner,
  FileClient,
  FileCustomer,
  FileVendor,
  FileSupplier,
  FileContractor,
  FileEmployee,
  FileManager,
  FileCeo,
  FileCto,
  FileCfo,
  FileCoo,
  FileCmo,
  FileChro,
  FileClo,
  FileCso,
  FileCpo,
  FileCdo,
  FileCio,
  FileCiso,
  FileCco,
  FileCfo as FileCfoIcon,
  FileCoo as FileCooIcon,
  FileCmo as FileCmoIcon,
  FileChro as FileChroIcon,
  FileClo as FileCloIcon,
  FileCso as FileCsoIcon,
  FileCpo as FileCpoIcon,
  FileCdo as FileCdoIcon,
  FileCio as FileCioIcon,
  FileCiso as FileCisoIcon,
  FileCco as FileCcoIcon,
  FileCfo as FileCfoIcon2,
  FileCoo as FileCooIcon2,
  FileCmo as FileCmoIcon2,
  FileChro as FileChroIcon2,
  FileClo as FileCloIcon2,
  FileCso as FileCsoIcon2,
  FileCpo as FileCpoIcon2,
  FileCdo as FileCdoIcon2,
  FileCio as FileCioIcon2,
  FileCiso as FileCisoIcon2,
  FileCco as FileCcoIcon2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from './ui/use-toast';
import { cn } from '../lib/utils';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company?: string;
  status: string;
  source: string;
  budget: number;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  assigned_user?: {
    full_name: string;
  } | null;
  nationality: string;
  preferred_location: string;
  preferred_property_type: string;
  preferred_bedrooms: number;
  preferred_bathrooms: number;
  preferred_area: string;
  preferred_amenities?: string;
  next_followup_date?: string;
}

interface LeadDetailsSidebarProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

const LeadDetailsSidebar: React.FC<LeadDetailsSidebarProps> = ({ lead, isOpen, onClose }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Lead>>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lead && isOpen) {
      fetchLeadData();
    }
  }, [lead, isOpen]);

  const fetchLeadData = async () => {
    if (!lead) return;
    
    setLoading(true);
    try {
      // Fetch activities, notes, tasks, deals
      const [activitiesRes, notesRes, tasksRes, dealsRes] = await Promise.all([
        supabase.from('calls').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false }),
        supabase.from('lead_notes').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false }),
        supabase.from('deals').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false }),
      ]);

      setActivities(activitiesRes.data || []);
      setNotes(notesRes.data || []);
      setTasks(tasksRes.data || []);
      setDeals(dealsRes.data || []);
    } catch (error) {
      console.error('Error fetching lead data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!lead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ ...editData, updated_at: new Date().toISOString() })
        .eq('id', lead.id);

      if (error) throw error;

      toast({ title: 'Lead updated successfully', variant: 'default' });
      setIsEditing(false);
      setEditData({});
    } catch (error: any) {
      toast({ title: 'Failed to update lead', description: error.message, variant: 'destructive' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      proposal: 'bg-purple-100 text-purple-800',
      negotiation: 'bg-orange-100 text-orange-800',
      closed_won: 'bg-emerald-100 text-emerald-800',
      closed_lost: 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-[400] overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-2xl">
          <div className="h-full flex flex-col bg-white/95 backdrop-blur-sm shadow-2xl border-l border-slate-200/50">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-14 w-14 ring-2 ring-slate-200/50 shadow-lg">
                    <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {lead.first_name?.[0]}{lead.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {lead.first_name} {lead.last_name}
                  </h2>
                  <p className="text-sm text-slate-600 flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>{lead.email}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:bg-white hover:border-slate-300 transition-all duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
                {isEditing && (
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-none shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="hover:bg-slate-100/80 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-slate-100/50 p-1 m-4 rounded-xl">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 rounded-lg transition-all duration-200">Overview</TabsTrigger>
                  <TabsTrigger value="activity" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 rounded-lg transition-all duration-200">Activity</TabsTrigger>
                  <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 rounded-lg transition-all duration-200">Notes</TabsTrigger>
                  <TabsTrigger value="tasks" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 rounded-lg transition-all duration-200">Tasks</TabsTrigger>
                  <TabsTrigger value="deals" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 rounded-lg transition-all duration-200">Deals</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50/50 to-white/50">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                {/* Overview Tab */}
                <TabsContent value="overview" className="p-6 space-y-6">
                  {/* Contact Information */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
                      <CardTitle className="flex items-center space-x-3 text-slate-900">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="text-lg font-semibold">Contact Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                            <span>First Name</span>
                          </label>
                          {isEditing ? (
                            <Input
                              value={editData.first_name || lead.first_name}
                              onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                              className="bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                            />
                          ) : (
                            <p className="text-sm text-slate-900 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-200/30">{lead.first_name}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                            <span>Last Name</span>
                          </label>
                          {isEditing ? (
                            <Input
                              value={editData.last_name || lead.last_name}
                              onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                              className="bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                            />
                          ) : (
                            <p className="text-sm text-slate-900 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-200/30">{lead.last_name}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>Email</span>
                        </label>
                        {isEditing ? (
                          <Input
                            value={editData.email || lead.email}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            className="bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                          />
                        ) : (
                          <p className="text-sm text-slate-900 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-200/30">{lead.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>Phone</span>
                        </label>
                        {isEditing ? (
                          <Input
                            value={editData.phone || lead.phone}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            className="bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                          />
                        ) : (
                          <p className="text-sm text-slate-900 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-200/30">{lead.phone}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span>Company</span>
                        </label>
                        {isEditing ? (
                          <Input
                            value={editData.company || lead.company || ''}
                            onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                            className="bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                          />
                        ) : (
                          <p className="text-sm text-slate-900 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-200/30">{lead.company || 'No company'}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lead Details */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
                      <CardTitle className="flex items-center space-x-3 text-slate-900">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                          <Target className="h-5 w-5 text-green-600" />
                        </div>
                        <span className="text-lg font-semibold">Lead Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Status</label>
                          {isEditing ? (
                            <Select
                              value={editData.status || lead.status}
                              onValueChange={(value) => setEditData({ ...editData, status: value })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="qualified">Qualified</SelectItem>
                                <SelectItem value="proposal">Proposal</SelectItem>
                                <SelectItem value="negotiation">Negotiation</SelectItem>
                                <SelectItem value="closed_won">Closed Won</SelectItem>
                                <SelectItem value="closed_lost">Closed Lost</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge className={cn("mt-1", getStatusColor(lead.status))}>
                              {lead.status}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Source</label>
                          {isEditing ? (
                            <Select
                              value={editData.source || lead.source}
                              onValueChange={(value) => setEditData({ ...editData, source: value })}
                            >
                              <SelectTrigger className="bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="referral">Referral</SelectItem>
                                <SelectItem value="social">Social Media</SelectItem>
                                <SelectItem value="direct">Direct</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <p className="text-sm text-slate-900 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-200/30">{lead.source}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Budget</span>
                        </label>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editData.budget || lead.budget || ''}
                            onChange={(e) => setEditData({ ...editData, budget: parseFloat(e.target.value) || 0 })}
                            className="bg-white/50 backdrop-blur-sm border-slate-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                          />
                        ) : (
                          <p className="text-sm text-slate-900 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-200/30 font-semibold">{formatCurrency(lead.budget || 0)}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>Assigned To</span>
                        </label>
                        <p className="text-sm text-slate-900 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-200/30">{lead.assigned_user?.full_name || 'Unassigned'}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Property Preferences */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200/50">
                      <CardTitle className="flex items-center space-x-3 text-slate-900">
                        <div className="p-2 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg">
                          <Home className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-lg font-semibold">Property Preferences</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>Preferred Location</span>
                          </label>
                          <p className="text-sm text-slate-900 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-200/30">{lead.preferred_location || 'Not specified'}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                            <Home className="h-4 w-4" />
                            <span>Property Type</span>
                          </label>
                          <p className="text-sm text-slate-900 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-200/30">{lead.preferred_property_type || 'Not specified'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                            <Bed className="h-4 w-4" />
                            <span>Bedrooms</span>
                          </label>
                          <p className="text-sm text-slate-900 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-200/30">{lead.preferred_bedrooms || 'Not specified'}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                            <Bath className="h-4 w-4" />
                            <span>Bathrooms</span>
                          </label>
                          <p className="text-sm text-slate-900 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-200/30">{lead.preferred_bathrooms || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>Preferred Area</span>
                        </label>
                        <p className="text-sm text-slate-900 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-200/30">{lead.preferred_area || 'Not specified'}</p>
                      </div>

                      {lead.preferred_amenities && (
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                            <Star className="h-4 w-4" />
                            <span>Amenities</span>
                          </label>
                          <p className="text-sm text-slate-900 bg-slate-50/50 px-3 py-2 rounded-lg border border-slate-200/30">{lead.preferred_amenities}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">Activity Timeline</h3>
                        <p className="text-sm text-slate-600">Track all interactions with this lead</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-white/80 backdrop-blur-sm border-slate-200/50 hover:bg-white hover:border-slate-300 transition-all duration-200"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                      </Button>
                    </div>
                    
                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-slate-200 rounded-lg w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded-lg w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : activities.length > 0 ? (
                      <div className="space-y-4">
                        {activities.map((activity, index) => (
                          <div key={index} className="flex items-start space-x-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
                              <Phone className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-900">Call made</p>
                              <p className="text-xs text-slate-600 mt-1">{formatDate(activity.created_at)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl opacity-80"></div>
                          <Activity className="relative w-10 h-10 text-slate-400 mx-auto mt-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No activity yet</h3>
                        <p className="text-sm text-slate-500">Start tracking interactions with this lead</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Notes</h3>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                    
                    {notes.length > 0 ? (
                      <div className="space-y-4">
                        {notes.map((note, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <p className="text-sm text-gray-900">{note.content}</p>
                              <p className="text-xs text-gray-600 mt-2">{formatDate(note.created_at)}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No notes yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tasks Tab */}
                <TabsContent value="tasks" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Tasks</h3>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                    
                    {tasks.length > 0 ? (
                      <div className="space-y-4">
                        {tasks.map((task, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium">{task.title}</p>
                                  <p className="text-xs text-gray-600">{task.description}</p>
                                </div>
                                <Badge variant={task.completed ? 'default' : 'secondary'}>
                                  {task.completed ? 'Completed' : 'Pending'}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No tasks assigned</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Deals Tab */}
                <TabsContent value="deals" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Deals</h3>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Deal
                      </Button>
                    </div>
                    
                    {deals.length > 0 ? (
                      <div className="space-y-4">
                        {deals.map((deal, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium">{deal.title}</p>
                                  <p className="text-xs text-gray-600">{formatCurrency(deal.amount || 0)}</p>
                                </div>
                                <Badge variant={deal.status === 'won' ? 'default' : 'secondary'}>
                                  {deal.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No deals associated</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsSidebar; 