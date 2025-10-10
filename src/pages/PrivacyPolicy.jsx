import { useSEO } from '../hooks/useSEO';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import Loading from '../components/ui/Loading';

const PrivacyPolicy = () => {
  const { settings, loading } = useSiteSettings();

  useSEO({
    title: `Privacy Policy - ${settings.site_name || 'Policy Drift News'}`,
    description: 'Our privacy policy explains how we collect, use, and protect your personal information. We are committed to data privacy and GDPR/CCPA compliance.',
    keywords: 'privacy policy, data protection, GDPR, CCPA, user privacy, data security',
    url: `${window.location.origin}/privacy-policy`,
    type: 'website'
  });

  if (loading) return <Loading />;

  const formatDate = (dateString) => {
    if (!dateString) return 'October 10, 2025';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const lastUpdated = formatDate(settings.privacy_last_updated);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg text-white/90">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 md:p-12 shadow-lg prose prose-lg dark:prose-invert max-w-none">
              
              {/* Introduction */}
              <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-0">
                  At {settings.company_name || settings.site_name || 'Policy Drift News'}, we take your privacy seriously. This Privacy Policy explains how we collect, 
                  use, disclose, and safeguard your information when you visit our website and use our services. 
                  Please read this privacy policy carefully.
                </p>
              </div>

              {/* Table of Contents */}
              <div className="mb-12 p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white mt-0">Table of Contents</h2>
                <ul className="space-y-2 text-blue-600 dark:text-blue-400">
                  <li><a href="#information-collection" className="hover:underline">1. Information We Collect</a></li>
                  <li><a href="#information-use" className="hover:underline">2. How We Use Your Information</a></li>
                  <li><a href="#information-sharing" className="hover:underline">3. Disclosure of Your Information</a></li>
                  <li><a href="#cookies" className="hover:underline">4. Cookies and Tracking Technologies</a></li>
                  <li><a href="#third-party" className="hover:underline">5. Third-Party Services</a></li>
                  <li><a href="#advertising" className="hover:underline">6. Advertising and Analytics</a></li>
                  <li><a href="#data-security" className="hover:underline">7. Data Security</a></li>
                  <li><a href="#your-rights" className="hover:underline">8. Your Privacy Rights</a></li>
                  <li><a href="#children" className="hover:underline">9. Children's Privacy</a></li>
                  <li><a href="#international" className="hover:underline">10. International Data Transfers</a></li>
                  <li><a href="#changes" className="hover:underline">11. Changes to This Policy</a></li>
                  <li><a href="#contact" className="hover:underline">12. Contact Us</a></li>
                </ul>
              </div>

              {/* Section 1 */}
              <section id="information-collection" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">1. Information We Collect</h2>
                
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">1.1 Personal Information</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  We may collect personal information that you voluntarily provide to us when you:
                </p>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li>Register for an account</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Post comments on articles</li>
                  <li>Contact us through our contact form</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  This information may include: name, email address, username, profile picture, and any other 
                  information you choose to provide.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">1.2 Automatically Collected Information</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  When you visit our website, we automatically collect certain information about your device, including:
                </p>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Referring website</li>
                  <li>Pages visited and time spent on each page</li>
                  <li>Device identifiers</li>
                  <li>Browsing behavior and patterns</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section id="information-use" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">2. How We Use Your Information</h2>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li><strong>To provide and maintain our services:</strong> Including account management, content delivery, and customer support</li>
                  <li><strong>To personalize your experience:</strong> Recommend content based on your interests and reading habits</li>
                  <li><strong>To send newsletters and updates:</strong> If you have opted in to receive them</li>
                  <li><strong>To improve our website:</strong> Analyze usage patterns and optimize performance</li>
                  <li><strong>To prevent fraud and ensure security:</strong> Monitor for suspicious activity and protect user accounts</li>
                  <li><strong>To display relevant advertising:</strong> Show ads that may be of interest to you</li>
                  <li><strong>To comply with legal obligations:</strong> Respond to legal requests and enforce our terms</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section id="information-sharing" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">3. Disclosure of Your Information</h2>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  We may share your information in the following situations:
                </p>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li><strong>With service providers:</strong> Third-party companies that help us operate our website (hosting, analytics, email services)</li>
                  <li><strong>With advertisers:</strong> As described in our advertising section below</li>
                  <li><strong>For legal purposes:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>With your consent:</strong> When you explicitly agree to share your information</li>
                </ul>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  We do NOT sell your personal information to third parties.
                </p>
              </section>

              {/* Section 4 */}
              <section id="cookies" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">4. Cookies and Tracking Technologies</h2>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  We use cookies and similar tracking technologies to track activity on our website and hold certain information.
                </p>
                
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Types of Cookies We Use:</h3>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Advertising Cookies:</strong> Used to deliver relevant ads to you</li>
                </ul>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. 
                  However, if you do not accept cookies, you may not be able to use some portions of our website.
                </p>
              </section>

              {/* Section 5 */}
              <section id="third-party" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">5. Third-Party Services</h2>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  Our website may contain links to third-party websites and services. We are not responsible for 
                  the privacy practices of these third parties. We encourage you to read their privacy policies.
                </p>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  Third-party services we use include:
                </p>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li><strong>Supabase:</strong> Database and authentication services</li>
                  <li><strong>Google Analytics:</strong> Website analytics (if implemented)</li>
                  <li><strong>Social Media Platforms:</strong> For sharing and social login features</li>
                </ul>
              </section>

              {/* Section 6 - Important for AdSense */}
              <section id="advertising" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">6. Advertising and Analytics</h2>
                
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">6.1 Google AdSense</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  We use Google AdSense to serve advertisements on our website. Google uses cookies to serve ads 
                  based on your prior visits to our website or other websites on the Internet.
                </p>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  Google's use of advertising cookies enables it and its partners to serve ads to you based on 
                  your visit to our site and/or other sites on the Internet.
                </p>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  You may opt out of personalized advertising by visiting 
                  <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline"> Google Ads Settings</a> or 
                  <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline"> www.aboutads.info</a>.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">6.2 Analytics Services</h3>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  We may use third-party analytics services to monitor and analyze website traffic. These services 
                  may use cookies and similar technologies to collect information about your use of our website.
                </p>
              </section>

              {/* Section 7 */}
              <section id="data-security" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">7. Data Security</h2>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  We implement appropriate technical and organizational security measures to protect your personal 
                  information, including:
                </p>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li>Encryption of data in transit (HTTPS/SSL)</li>
                  <li>Secure authentication systems</li>
                  <li>Regular security audits</li>
                  <li>Access controls and authorization</li>
                  <li>Secure data storage with Supabase</li>
                </ul>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  However, no method of transmission over the Internet or electronic storage is 100% secure. 
                  While we strive to protect your personal information, we cannot guarantee its absolute security.
                </p>
              </section>

              {/* Section 8 - Important for GDPR/CCPA */}
              <section id="your-rights" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">8. Your Privacy Rights</h2>
                
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">8.1 General Rights</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                  <li><strong>Right to Restrict Processing:</strong> Request limitation of data processing</li>
                  <li><strong>Right to Data Portability:</strong> Request transfer of your data</li>
                  <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
                  <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
                </ul>

                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">8.2 GDPR Rights (European Users)</h3>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  If you are a resident of the European Economic Area (EEA), you have additional rights under GDPR. 
                  You may file a complaint with your local data protection authority if you believe we have not 
                  complied with applicable data protection laws.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">8.3 CCPA Rights (California Residents)</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  If you are a California resident, you have the following rights under CCPA:
                </p>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li>Right to know what personal information is collected</li>
                  <li>Right to know if personal information is sold or disclosed</li>
                  <li>Right to say no to the sale of personal information</li>
                  <li>Right to access your personal information</li>
                  <li>Right to equal service and price, even if you exercise your privacy rights</li>
                </ul>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  To exercise these rights, please contact us at {settings.dpo_email || settings.contact_email || 'privacy@policydrift.news'}.
                </p>
              </section>

              {/* Section 9 */}
              <section id="children" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">9. Children's Privacy</h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  Our website is not intended for children under 13 years of age. We do not knowingly collect 
                  personal information from children under 13. If we learn that we have collected personal information 
                  from a child under 13, we will delete it promptly. If you believe we have collected information 
                  from a child under 13, please contact us immediately.
                </p>
              </section>

              {/* Section 10 */}
              <section id="international" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">10. International Data Transfers</h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  Your information may be transferred to and maintained on servers located outside of your state, 
                  province, country, or other governmental jurisdiction. We ensure appropriate safeguards are in 
                  place to protect your personal information in accordance with this Privacy Policy.
                </p>
              </section>

              {/* Section 11 */}
              <section id="changes" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">11. Changes to This Privacy Policy</h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
                  the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to 
                  review this Privacy Policy periodically for any changes.
                </p>
              </section>

              {/* Section 12 */}
              <section id="contact" className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">12. Contact Us</h2>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  If you have any questions about this Privacy Policy or wish to exercise your privacy rights, 
                  please contact us:
                </p>
                <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="mb-2 text-slate-700 dark:text-slate-300"><strong>Email:</strong> {settings.dpo_email || settings.contact_email || 'privacy@policydrift.news'}</p>
                  {settings.dpo_name && (
                    <p className="mb-2 text-slate-700 dark:text-slate-300"><strong>Data Protection Officer:</strong> {settings.dpo_name}</p>
                  )}
                  <p className="mb-2 text-slate-700 dark:text-slate-300"><strong>Website:</strong> <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Form</a></p>
                  <p className="mb-0 text-slate-700 dark:text-slate-300"><strong>Response Time:</strong> We will respond to your request within 30 days</p>
                </div>
              </section>

              {/* Compliance Notice */}
              <div className="mt-12 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <h3 className="text-xl font-bold mb-3 text-green-900 dark:text-green-100 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Compliance Statement
                </h3>
                <p className="text-green-800 dark:text-green-200 mb-0">
                  This privacy policy is designed to comply with the General Data Protection Regulation (GDPR), 
                  California Consumer Privacy Act (CCPA), and Google AdSense policies. We are committed to 
                  protecting your privacy and ensuring transparent data practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
