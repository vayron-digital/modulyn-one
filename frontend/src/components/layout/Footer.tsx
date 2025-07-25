import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  Shield,
  Zap,
  Users,
  Globe,
  ArrowUpRight
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10"></div>
      
      {/* Main Footer Content */}
      <div className="relative z-10">
        {/* Top Section */}
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="lg:col-span-1">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Vayron CRM</h3>
                    <p className="text-sm text-slate-300">Premium Customer Management</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Transform your customer relationships with our powerful, intuitive CRM platform. 
                  Built for modern businesses that demand excellence.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 group">
                    <Twitter className="w-5 h-5 text-slate-300 group-hover:text-white" />
                  </a>
                  <a href="#" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 group">
                    <Linkedin className="w-5 h-5 text-slate-300 group-hover:text-white" />
                  </a>
                  <a href="#" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 group">
                    <Github className="w-5 h-5 text-slate-300 group-hover:text-white" />
                  </a>
                </div>
              </div>

              {/* Product Links */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-6">Product</h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/dashboard" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group">
                      <span>Dashboard</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/leads" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group">
                      <span>Lead Management</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/tasks" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group">
                      <span>Task Management</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/properties" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group">
                      <span>Properties</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/reports" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group">
                      <span>Reports & Analytics</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-6">Company</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group">
                      <span>About Us</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group">
                      <span>Careers</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group">
                      <span>Blog</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group">
                      <span>Press</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group">
                      <span>Partners</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support & Contact */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-6">Support</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group">
                      <span>Help Center</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group">
                      <span>Documentation</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group">
                      <span>Contact Sales</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200 flex items-center group">
                      <span>Status</span>
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                </ul>

                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-slate-300">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">support@vayron.com</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-300">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">+1 (555) 123-4567</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-2 text-slate-300 text-sm">
              <span>© {currentYear} Vayron Digital Solutions. All rights reserved.</span>
              <span>•</span>
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>for modern businesses</span>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors duration-200">
                Cookie Policy
              </a>
              <button 
                onClick={scrollToTop}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 group"
                title="Back to top"
              >
                <svg className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 