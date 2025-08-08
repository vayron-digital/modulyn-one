import React from 'react';
import { Shield, Lock, Eye, Database, Globe, Mail, Phone, MapPin } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const lastUpdated = "December 20, 2024";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          </div>
          <p className="text-slate-600 text-lg">
            How Modulyn collects, uses, and protects your personal information
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
            
            {/* Contact Information */}
            <section className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact Information
              </h2>
              <div className="space-y-2 text-sm text-slate-700">
                <p><strong>Company:</strong> Vayron Digital Solutions</p>
                <p><strong>Product:</strong> Modulyn CRM Platform</p>
                <p><strong>Email:</strong> privacy@vayrondigital.com</p>
                <p><strong>Legal Contact:</strong> legal@vayrondigital.com</p>
                <p><strong>Data Protection Officer:</strong> dpo@vayrondigital.com</p>
              </div>
            </section>

            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Introduction</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed">
                  At Vayron Digital Solutions ("we," "our," or "us"), we operate the Modulyn CRM platform ("Service"). 
                  We are committed to protecting your privacy and being transparent about how we collect, use, and share your information.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  This Privacy Policy explains our practices regarding personal data when you use our Service, 
                  including data collection, processing, storage, and your rights as a data subject.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                2. Information We Collect
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Account Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Name, email address, and phone number</li>
                    <li>Company name, job title, and professional details</li>
                    <li>Profile photo (if provided)</li>
                    <li>Password (encrypted and never stored in plain text)</li>
                    <li>OAuth provider information (Google, etc.) when using social login</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Business Data</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Customer and lead information you input</li>
                    <li>Property listings and real estate data</li>
                    <li>Communication logs and call records</li>
                    <li>Task and project management data</li>
                    <li>Documents and files you upload</li>
                    <li>Chat messages and team communications</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Technical Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>IP address and general location (city/country level)</li>
                    <li>Browser type, device information, and operating system</li>
                    <li>Usage patterns and feature interactions</li>
                    <li>Error logs and performance metrics</li>
                    <li>Session information and login timestamps</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Payment Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Billing address and company information</li>
                    <li>Subscription plan and billing history</li>
                    <li><strong>Note:</strong> Credit card data is processed by FastSpring (our payment processor) - we never store payment card information</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                3. How We Use Your Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Service Provision</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Provide and maintain the Modulyn CRM platform</li>
                    <li>Process your transactions and manage your account</li>
                    <li>Enable team collaboration and data sharing within your organization</li>
                    <li>Provide customer support and respond to inquiries</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Communication</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Send important service updates and security notifications</li>
                    <li>Respond to support requests and provide assistance</li>
                    <li>Send promotional materials only with your explicit consent</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Improvement and Analytics</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Analyze usage patterns to improve our services</li>
                    <li>Develop new features and functionality</li>
                    <li>Monitor system performance and security</li>
                    <li>Generate anonymized usage statistics</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Legal and Security</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li>Comply with legal obligations and law enforcement requests</li>
                    <li>Protect against fraud, abuse, and security threats</li>
                    <li>Enforce our Terms of Service</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                4. Information Sharing and Disclosure
              </h2>
              
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 font-medium">
                    We do not sell, rent, or trade your personal information to third parties for marketing purposes.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">We may share information in these limited circumstances:</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li><strong>Service Providers:</strong> Trusted third parties who help us operate our service (hosting, analytics, payment processing)</li>
                    <li><strong>Team Members:</strong> Within your organization/tenant for collaboration purposes</li>
                    <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                    <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of business assets</li>
                    <li><strong>Safety and Security:</strong> To protect rights, property, or safety of users or the public</li>
                    <li><strong>With Consent:</strong> Any other sharing with your explicit permission</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-3">Third-Party Services We Use:</h3>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li><strong>Supabase:</strong> Database and authentication services</li>
                    <li><strong>FastSpring:</strong> Payment processing</li>
                    <li><strong>Vercel:</strong> Web hosting and deployment</li>
                    <li><strong>Google OAuth:</strong> Authentication (when you choose to use it)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                5. Data Security
              </h2>
              
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  We implement industry-standard security measures to protect your information:
                </p>
                
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest</li>
                  <li><strong>Access Controls:</strong> Strict access controls and role-based permissions</li>
                  <li><strong>Authentication:</strong> Secure authentication with optional two-factor authentication</li>
                  <li><strong>Infrastructure:</strong> Hosted on secure, compliant cloud infrastructure</li>
                  <li><strong>Monitoring:</strong> Continuous security monitoring and regular security audits</li>
                  <li><strong>Data Backups:</strong> Regular encrypted backups with secure storage</li>
                </ul>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <strong>Note:</strong> While we implement robust security measures, no system is 100% secure. 
                    We cannot guarantee absolute security but are committed to protecting your data to the best of our ability.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Data Retention</h2>
              
              <div className="space-y-4">
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li><strong>Active Accounts:</strong> We retain your data while your account is active</li>
                  <li><strong>Account Deletion:</strong> Data is deleted within 30 days of account termination</li>
                  <li><strong>Backup Retention:</strong> Backup copies may persist for up to 90 days for disaster recovery</li>
                  <li><strong>Legal Requirements:</strong> Some data may be retained longer if required by law</li>
                  <li><strong>Anonymized Data:</strong> We may retain anonymized usage statistics indefinitely</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Your Privacy Rights</h2>
              
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  You have the following rights regarding your personal data:
                </p>
                
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li><strong>Restriction:</strong> Limit how we process your data</li>
                  <li><strong>Objection:</strong> Object to certain types of processing</li>
                  <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
                </ul>

                <p className="text-slate-700 leading-relaxed">
                  To exercise these rights, contact us at privacy@vayrondigital.com. 
                  We will respond within 30 days of receiving your request.
                </p>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Cookies and Tracking</h2>
              
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  We use cookies and similar technologies to:
                </p>
                
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Maintain your login session</li>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze usage patterns and improve our service</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>

                <p className="text-slate-700 leading-relaxed">
                  You can control cookies through your browser settings. Disabling certain cookies may limit functionality.
                </p>
              </div>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">9. International Data Transfers</h2>
              
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  Our services are hosted primarily in the United States. If you are located outside the US, 
                  your data may be transferred to and processed in the US or other countries where our service providers operate.
                </p>
                
                <p className="text-slate-700 leading-relaxed">
                  We ensure appropriate safeguards are in place for international transfers, including:
                </p>
                
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Standard Contractual Clauses with service providers</li>
                  <li>Adequacy decisions from relevant authorities</li>
                  <li>Compliance with applicable data protection frameworks</li>
                </ul>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">10. Children's Privacy</h2>
              
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect 
                  personal information from children under 13. If we become aware that we have collected 
                  personal information from a child under 13, we will take steps to delete such information.
                </p>
              </div>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">11. Changes to This Privacy Policy</h2>
              
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. When we make changes, we will:
                </p>
                
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  <li>Update the "Last updated" date at the top of this policy</li>
                  <li>Notify users via email for material changes</li>
                  <li>Post a notice in our application for significant updates</li>
                  <li>Maintain previous versions for your reference</li>
                </ul>

                <p className="text-slate-700 leading-relaxed">
                  Your continued use of our service after changes constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-slate-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">12. Contact Us</h2>
              
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  If you have questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                
                <div className="space-y-2 text-slate-700">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>Email: privacy@vayrondigital.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span>Legal: legal@vayrondigital.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <span>Data Protection Officer: dpo@vayrondigital.com</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mt-4">
                  We are committed to resolving any privacy concerns promptly and transparently.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
