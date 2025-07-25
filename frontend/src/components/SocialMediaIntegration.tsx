import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { 
  MessageCircle, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Youtube, 
  Globe, 
  Share2, 
  Heart, 
  ThumbsUp, 
  MessageSquare, 
  Retweet, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Building, 
  Home, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Filter, 
  Search, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Activity, 
  Bell, 
  BellOff, 
  Star, 
  StarOff, 
  Bookmark, 
  BookmarkPlus, 
  BookmarkMinus, 
  Flag, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  RefreshCw, 
  Save, 
  Copy, 
  ExternalLink, 
  Link, 
  Unlink, 
  Maximize, 
  Minimize, 
  Move, 
  GripVertical, 
  Archive, 
  ArchiveRestore, 
  Download, 
  Upload, 
  Play, 
  Pause, 
  Stop, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Camera, 
  CameraOff, 
  Image, 
  ImageOff, 
  File, 
  FileText, 
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
  FileWifi, 
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
  FileBridge, 
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
  FileSend, 
  FileReceive, 
  FileImport, 
  FileExport, 
  FileUpload, 
  FileDownload, 
  FileTransfer, 
  FileMove, 
  FileCopy, 
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
  FileDirector, 
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
import { cn } from '../lib/utils';

interface SocialPost {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube';
  content: string;
  image?: string;
  scheduledFor?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views: number;
  };
  createdAt: string;
}

interface SocialProfile {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube';
  username: string;
  displayName: string;
  avatar: string;
  isConnected: boolean;
  followers: number;
  following: number;
  posts: number;
}

interface SocialMention {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'youtube';
  author: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  engagement: number;
  createdAt: string;
}

const SocialMediaIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  const [mentions, setMentions] = useState<SocialMention[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [showComposer, setShowComposer] = useState(false);

  const platforms = [
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-500' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500' },
  ];

  const mockPosts: SocialPost[] = [
    {
      id: '1',
      platform: 'twitter',
      content: 'Excited to announce our new premium lead management system! 🚀 #CRM #Sales',
      status: 'published',
      engagement: { likes: 45, shares: 12, comments: 8, views: 1200 },
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      platform: 'linkedin',
      content: 'How we increased lead conversion by 300% using our new automation tools. Read more in our latest case study.',
      status: 'scheduled',
      scheduledFor: '2024-01-16T14:00:00Z',
      engagement: { likes: 0, shares: 0, comments: 0, views: 0 },
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: '3',
      platform: 'facebook',
      content: 'Join us for our upcoming webinar on "Advanced Lead Scoring Techniques" - Register now!',
      status: 'draft',
      engagement: { likes: 0, shares: 0, comments: 0, views: 0 },
      createdAt: '2024-01-15T08:00:00Z'
    }
  ];

  const mockProfiles: SocialProfile[] = [
    {
      id: '1',
      platform: 'twitter',
      username: '@modulyncrm',
      displayName: 'Modulyn CRM',
      avatar: '/logo.png',
      isConnected: true,
      followers: 1250,
      following: 890,
      posts: 156
    },
    {
      id: '2',
      platform: 'linkedin',
      username: 'modulyn-crm',
      displayName: 'Modulyn CRM',
      avatar: '/logo.png',
      isConnected: true,
      followers: 3400,
      following: 1200,
      posts: 89
    },
    {
      id: '3',
      platform: 'facebook',
      username: 'modulyncrm',
      displayName: 'Modulyn CRM',
      avatar: '/logo.png',
      isConnected: false,
      followers: 0,
      following: 0,
      posts: 0
    }
  ];

  const mockMentions: SocialMention[] = [
    {
      id: '1',
      platform: 'twitter',
      author: '@john_doe',
      content: 'Just tried @modulyncrm and it\'s amazing! The lead scoring is spot on 👏',
      sentiment: 'positive',
      engagement: 23,
      createdAt: '2024-01-15T11:30:00Z'
    },
    {
      id: '2',
      platform: 'linkedin',
      author: 'Sarah Wilson',
      content: 'Modulyn CRM has transformed our sales process. Highly recommend!',
      sentiment: 'positive',
      engagement: 15,
      createdAt: '2024-01-15T10:15:00Z'
    },
    {
      id: '3',
      platform: 'twitter',
      author: '@tech_critic',
      content: '@modulyncrm needs to improve their mobile app interface',
      sentiment: 'negative',
      engagement: 8,
      createdAt: '2024-01-15T09:45:00Z'
    }
  ];

  useEffect(() => {
    setPosts(mockPosts);
    setProfiles(mockProfiles);
    setMentions(mockMentions);
  }, []);

  const getPlatformIcon = (platform: string) => {
    const platformConfig = platforms.find(p => p.id === platform);
    return platformConfig?.icon || Globe;
  };

  const getPlatformColor = (platform: string) => {
    const platformConfig = platforms.find(p => p.id === platform);
    return platformConfig?.color || 'text-gray-500';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50';
      case 'scheduled': return 'text-blue-600 bg-blue-50';
      case 'draft': return 'text-gray-600 bg-gray-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Connected Accounts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => {
              const Icon = getPlatformIcon(profile.platform);
              const color = getPlatformColor(profile.platform);
              
              return (
                <div key={profile.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className={cn("p-2 rounded-full", color.replace('text-', 'bg-').replace('-500', '-100'))}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{profile.displayName}</h4>
                    <p className="text-sm text-gray-600">{profile.username}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{profile.followers} followers</span>
                      <span>{profile.posts} posts</span>
                    </div>
                  </div>
                  <Badge variant={profile.isConnected ? 'default' : 'secondary'}>
                    {profile.isConnected ? 'Connected' : 'Connect'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Recent Posts</span>
            </div>
            <Button size="sm" onClick={() => setShowComposer(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {posts.map((post) => {
              const Icon = getPlatformIcon(post.platform);
              const color = getPlatformColor(post.platform);
              
              return (
                <div key={post.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                  <div className={cn("p-2 rounded-full", color.replace('text-', 'bg-').replace('-500', '-100'))}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-900 mb-3">{post.content}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.engagement.likes}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Share2 className="h-3 w-3" />
                        <span>{post.engagement.shares}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{post.engagement.comments}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.engagement.views}</span>
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Brand Mentions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Brand Mentions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mentions.map((mention) => {
              const Icon = getPlatformIcon(mention.platform);
              const color = getPlatformColor(mention.platform);
              
              return (
                <div key={mention.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                  <div className={cn("p-2 rounded-full", color.replace('text-', 'bg-').replace('-500', '-100'))}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{mention.author}</span>
                      <Badge className={getSentimentColor(mention.sentiment)}>
                        {mention.sentiment}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-900 mb-2">{mention.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{mention.engagement} engagement</span>
                      <span>{formatDate(mention.createdAt)}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderComposer = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Create New Post</span>
          <Button variant="ghost" size="sm" onClick={() => setShowComposer(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Platforms</label>
          <div className="flex space-x-2">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <Button
                  key={platform.id}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{platform.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Content</label>
          <Textarea
            placeholder="What's on your mind?"
            className="min-h-[120px]"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Schedule</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Post now" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="now">Post now</SelectItem>
              <SelectItem value="schedule">Schedule for later</SelectItem>
              <SelectItem value="draft">Save as draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setShowComposer(false)}>
            Cancel
          </Button>
          <Button>
            <Share2 className="h-4 w-4 mr-2" />
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Followers</p>
                <p className="text-2xl font-bold text-gray-900">5,650</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5%
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">4.2%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.8%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reach</p>
                <p className="text-2xl font-bold text-gray-900">12.4K</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18.2%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leads Generated</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +23.4%
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <UserPlus className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <BarChart3 className="h-12 w-12" />
            <span className="ml-2">Platform performance chart will be displayed here</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Media Integration</h1>
            <p className="text-gray-600 mt-1">Manage your social media presence and monitor brand mentions</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Connect Account
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="composer">Post Composer</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {showComposer ? renderComposer() : renderOverview()}
          </TabsContent>

          <TabsContent value="composer" className="mt-6">
            {renderComposer()}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            {renderAnalytics()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SocialMediaIntegration; 