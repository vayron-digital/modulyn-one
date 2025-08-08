import React from 'react';
import { FileText, Shield, AlertTriangle, Scale, Users, CreditCard, Globe } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const lastUpdated = "December 20, 2024";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
          </div>
          <p className="text-slate-600 text-lg">
            Legal terms governing your use of the Modulyn CRM platform
          </p>
          <div className="mt-4 text-sm text-slate-500">
            Last updated: {lastUpdated}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* Important Notice */}
            <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-lg font-semibold text-amber-900 mb-2">Important Notice</h2>
                  <p className="text-amber-800">
                    By accessing or using Modulyn, you agree to be bound by these Terms of Service. 
                    If you do not agree to these terms, please do not use our service.
                  </p>
                </div>
              </div>
            </section>

            {/* Company Information */}
            <section className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Company Information</h2>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Company:</strong> Vayron Digital Solutions</p>
                <p><strong>Service:</strong> Modulyn CRM Platform</p>
                <p><strong>Contact:</strong> legal@vayrondigital.com</p>
                <p><strong>Support:</strong> support@vayrondigital.com</p>
                <p><strong>Website:</strong> https://modulyn.com</p>
              </div>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed">
                  These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") 
                  and Vayron Digital Solutions ("Company," "we," "us," or "our") regarding your use of the Modulyn CRM platform ("Service").
                </p>
                <p className="text-slate-700 leading-relaxed">
                  By creating an account, accessing, or using our Service, you acknowledge that you have read, understood, 
                  and agree to be bound by these Terms and our Privacy Policy, which is incorporated herein by reference.
                </p>
              </div>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                2. Service Description
              </h2>
              
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  Modulyn is a cloud-based Customer Relationship Management (CRM) platform designed for real estate professionals 
                  and businesses. Our Service provides:
                </p>
                
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Lead and customer management tools</li>
                  <li>Property listing management</li>
                  <li>Task and project tracking</li>
                  <li>Team collaboration features</li>
                  <li>Communication and calling capabilities</li>
                  <li>Document storage and management</li>
                  <li>Analytics and reporting tools</li>
                  <li>Integration with third-party services</li>
                </ul>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <strong>Service Availability:</strong> While we strive for 99.9% uptime, we cannot guarantee uninterrupted service. 
                    Scheduled maintenance will be communicated in advance when possible.
                  </p>
                </div>
              </div>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                3. User Accounts and Registration
              </h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900">Account Requirements</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>You must be at least 18 years old to create an account</li>
                  <li>You must provide accurate and complete registration information</li>
                  <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li>You must promptly update your account information when changes occur</li>
                  <li>One person may not maintain multiple accounts</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900">Account Security</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>You are solely responsible for all activities under your account</li>
                  <li>You must immediately notify us of any unauthorized access or security breach</li>
                  <li>We strongly recommend enabling two-factor authentication</li>
                  <li>You must not share your login credentials with others</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900">Account Termination</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>You may terminate your account at any time through your account settings</li>
                  <li>We may suspend or terminate accounts that violate these Terms</li>
                  <li>Upon termination, your access to the Service will cease immediately</li>
                  <li>Data deletion will occur within 30 days of account termination</li>
                </ul>
              </div>
            </section>

            {/* Acceptable Use */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                4. Acceptable Use Policy
              </h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900">Permitted Uses</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Use the Service for legitimate business purposes</li>
                  <li>Store and manage your business data and communications</li>
                  <li>Collaborate with team members within your organization</li>
                  <li>Integrate with approved third-party services</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900 text-red-700">Prohibited Uses</h3>
                <p className="text-slate-700">You may not use our Service to:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Upload, store, or transmit any unlawful, harmful, or offensive content</li>
                  <li>Violate any applicable laws, regulations, or third-party rights</li>
                  <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                  <li>Distribute malware, viruses, or other malicious code</li>
                  <li>Engage in spamming, phishing, or other abusive communication practices</li>
                  <li>Reverse engineer, decompile, or attempt to extract source code</li>
                  <li>Use the Service for competitive intelligence or benchmarking</li>
                  <li>Store or process data in violation of applicable privacy laws</li>
                  <li>Resell, redistribute, or create derivative works of our Service</li>
                </ul>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">
                    <strong>Violations:</strong> We reserve the right to investigate suspected violations and take appropriate action, 
                    including account suspension, termination, and cooperation with law enforcement.
                  </p>
                </div>
              </div>
            </section>

            {/* Subscription and Billing */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                5. Subscription Plans and Billing
              </h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900">Subscription Plans</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li><strong>Free Trial:</strong> 14-day trial with full feature access</li>
                  <li><strong>Modulyn One+:</strong> $9/month - Full-featured CRM for growing teams</li>
                  <li><strong>Modulyn One Pro:</strong> $29/month - Enterprise-grade with unlimited features</li>
                  <li>All plans are billed monthly unless otherwise specified</li>
                  <li>Pricing is subject to change with 30 days notice</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900">Payment Terms</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Payments are processed securely through FastSpring</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>You authorize automatic recurring billing for your selected plan</li>
                  <li>Failed payments may result in service suspension</li>
                  <li>You are responsible for all applicable taxes</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900">Cancellation and Refunds</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>You may cancel your subscription at any time</li>
                  <li>Cancellation takes effect at the end of your current billing period</li>
                  <li>No refunds for partial months or unused features</li>
                  <li>Data access continues until the end of your paid period</li>
                </ul>
              </div>
            </section>

            {/* Data and Privacy */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Data Ownership and Privacy</h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900">Your Data</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>You retain ownership of all data you upload to our Service</li>
                  <li>You grant us a limited license to process your data to provide the Service</li>
                  <li>You are responsible for the accuracy and legality of your data</li>
                  <li>You must comply with applicable data protection laws (GDPR, CCPA, etc.)</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900">Data Security</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>We implement industry-standard security measures</li>
                  <li>All data is encrypted in transit and at rest</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Incident response procedures for security breaches</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900">Data Processing</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>We process data solely to provide and improve our Service</li>
                  <li>We do not sell or rent your data to third parties</li>
                  <li>Anonymous usage analytics may be collected for service improvement</li>
                  <li>See our Privacy Policy for detailed information</li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                7. Intellectual Property Rights
              </h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900">Our Intellectual Property</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Modulyn platform, including software, designs, and documentation</li>
                  <li>Trademarks, service marks, and logos</li>
                  <li>Proprietary algorithms and methodologies</li>
                  <li>All improvements and derivatives of our Service</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900">Your Rights</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Limited, non-exclusive license to use the Service</li>
                  <li>No rights to our source code or proprietary technology</li>
                  <li>No right to sublicense or transfer access to others</li>
                  <li>License terminates upon account termination</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900">Respect for Third-Party Rights</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>You must not infringe on others' intellectual property rights</li>
                  <li>We respond to valid DMCA takedown notices</li>
                  <li>Repeat infringers may have their accounts terminated</li>
                </ul>
              </div>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Service Availability and Modifications</h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900">Service Availability</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>We strive to maintain 99.9% uptime availability</li>
                  <li>Scheduled maintenance will be announced in advance when possible</li>
                  <li>Emergency maintenance may occur without notice</li>
                  <li>Service may be temporarily unavailable due to technical issues</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900">Service Modifications</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>We may modify, update, or discontinue features</li>
                  <li>Major changes will be communicated to users</li>
                  <li>We reserve the right to modify these Terms</li>
                  <li>Continued use constitutes acceptance of modifications</li>
                </ul>
              </div>
            </section>

            {/* Third-Party Integrations */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Third-Party Services and Integrations</h2>
              
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  Our Service may integrate with or link to third-party services, including:
                </p>
                
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Google OAuth for authentication</li>
                  <li>FastSpring for payment processing</li>
                  <li>Email and communication services</li>
                  <li>Other business applications and APIs</li>
                </ul>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800">
                    <strong>Important:</strong> We are not responsible for third-party services, their availability, 
                    security, or privacy practices. Your use of third-party services is governed by their respective terms and policies.
                  </p>
                </div>
              </div>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">10. Disclaimers and Limitations</h2>
              
              <div className="space-y-4">
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-4">
                  <p className="text-slate-800 font-medium mb-2">SERVICE PROVIDED "AS IS"</p>
                  <p className="text-slate-700 text-sm">
                    The Service is provided on an "as is" and "as available" basis. We disclaim all warranties, 
                    express or implied, including warranties of merchantability, fitness for a particular purpose, 
                    and non-infringement.
                  </p>
                </div>

                <h3 className="text-lg font-medium text-slate-900">Limitation of Liability</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Our liability is limited to the amount you paid in the last 12 months</li>
                  <li>We are not liable for indirect, incidental, or consequential damages</li>
                  <li>We are not responsible for data loss due to user error or third-party services</li>
                  <li>These limitations apply to the fullest extent permitted by law</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900">Your Responsibilities</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Maintain regular backups of your important data</li>
                  <li>Use the Service in compliance with applicable laws</li>
                  <li>Promptly report security issues or bugs</li>
                  <li>Keep your account information current and secure</li>
                </ul>
              </div>
            </section>

            {/* Indemnification */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">11. Indemnification</h2>
              
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Vayron Digital Solutions, its officers, directors, 
                  employees, and agents from any claims, damages, losses, or expenses arising from:
                </p>
                
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Your use of the Service</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of applicable laws or regulations</li>
                  <li>Your infringement of third-party rights</li>
                  <li>Any content you submit to the Service</li>
                </ul>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">12. Governing Law and Dispute Resolution</h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900">Governing Law</h3>
                <p className="text-slate-700 leading-relaxed">
                  These Terms are governed by and construed in accordance with the laws of the jurisdiction where 
                  Vayron Digital Solutions is incorporated, without regard to conflict of law principles.
                </p>

                <h3 className="text-lg font-medium text-slate-900">Dispute Resolution</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>We encourage resolving disputes through direct communication</li>
                  <li>Contact us at legal@vayrondigital.com for dispute resolution</li>
                  <li>Formal disputes may be subject to binding arbitration</li>
                  <li>Class action lawsuits are waived to the extent permitted by law</li>
                </ul>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">13. Termination</h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900">Termination by You</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>You may terminate your account at any time</li>
                  <li>Cancellation takes effect at the end of your billing period</li>
                  <li>You remain responsible for all charges incurred before termination</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900">Termination by Us</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>We may terminate accounts that violate these Terms</li>
                  <li>We may suspend service for non-payment</li>
                  <li>We may discontinue the Service with reasonable notice</li>
                </ul>

                <h3 className="text-lg font-medium text-slate-900">Effect of Termination</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Your access to the Service will cease immediately</li>
                  <li>Your data will be deleted within 30 days</li>
                  <li>Provisions that should survive termination will remain in effect</li>
                </ul>
              </div>
            </section>

            {/* General Provisions */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">14. General Provisions</h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900">Entire Agreement</h3>
                <p className="text-slate-700 leading-relaxed">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and us 
                  regarding the Service and supersede all prior agreements.
                </p>

                <h3 className="text-lg font-medium text-slate-900">Severability</h3>
                <p className="text-slate-700 leading-relaxed">
                  If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
                </p>

                <h3 className="text-lg font-medium text-slate-900">Assignment</h3>
                <p className="text-slate-700 leading-relaxed">
                  You may not assign these Terms without our written consent. We may assign these Terms in connection with a merger, acquisition, or sale of assets.
                </p>

                <h3 className="text-lg font-medium text-slate-900">Force Majeure</h3>
                <p className="text-slate-700 leading-relaxed">
                  We are not liable for any failure to perform due to circumstances beyond our reasonable control, 
                  including natural disasters, war, terrorism, or government actions.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-slate-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">15. Contact Information</h2>
              
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                
                <div className="space-y-2 text-slate-700">
                  <p><strong>Legal Inquiries:</strong> legal@vayrondigital.com</p>
                  <p><strong>General Support:</strong> support@vayrondigital.com</p>
                  <p><strong>Billing Questions:</strong> billing@vayrondigital.com</p>
                  <p><strong>Security Issues:</strong> security@vayrondigital.com</p>
                </div>

                <p className="text-sm text-slate-600 mt-4">
                  We are committed to addressing your concerns promptly and professionally.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
