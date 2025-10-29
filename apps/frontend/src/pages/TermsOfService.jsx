import { useSEO } from '../hooks/useSEO';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import Loading from '../components/ui/Loading';

const TermsOfService = () => {
  const { settings, loading } = useSiteSettings();

  useSEO({
    title: `Terms of Service - ${settings.site_name || 'Policy Drift News'}`,
    description: 'Terms of Service. Please read these terms carefully before using our website and services.',
    keywords: 'terms of service, user agreement, terms and conditions, legal',
    url: `${window.location.origin}/terms-of-service`,
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

  const lastUpdated = formatDate(settings.terms_last_updated);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
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
                  Welcome to {settings.company_name || settings.site_name || 'Policy Drift News'}. By accessing or using our website, you agree to be bound by these 
                  Terms of Service. If you disagree with any part of these terms, please do not use our website.
                </p>
              </div>

              {/* 1. Acceptance of Terms */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  These Terms of Service constitute a legally binding agreement between you and {settings.company_name || settings.site_name || 'Policy Drift News'}. 
                  By using our website, you represent that you are at least 18 years old or have the consent of a 
                  parent or guardian.
                </p>
              </section>

              {/* 2. Use of Services */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">2. Use of Services</h2>
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">2.1 Permitted Use</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-300">You may use our website for:</p>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li>Reading and consuming news content</li>
                  <li>Creating a user account</li>
                  <li>Commenting on articles</li>
                  <li>Bookmarking and sharing content</li>
                  <li>Subscribing to our newsletter</li>
                </ul>

                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">2.2 Prohibited Use</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-300">You may NOT:</p>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Post spam, malicious code, or harmful content</li>
                  <li>Harass, threaten, or abuse other users</li>
                  <li>Impersonate others or provide false information</li>
                  <li>Scrape or copy content without permission</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper functioning of the website</li>
                </ul>
              </section>

              {/* 3. User Accounts */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">3. User Accounts</h2>
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">3.1 Account Creation</h3>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  You are responsible for maintaining the confidentiality of your account credentials. You agree to 
                  provide accurate and complete information when creating an account and to update it as necessary.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">3.2 Account Security</h3>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  You are responsible for all activities that occur under your account. Notify us immediately if 
                  you suspect any unauthorized use of your account.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">3.3 Account Termination</h3>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  We reserve the right to suspend or terminate your account at any time for violating these Terms 
                  of Service or for any other reason at our discretion.
                </p>
              </section>

              {/* 4. User Content */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">4. User Content</h2>
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">4.1 Content Responsibility</h3>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  You are solely responsible for any content you post, including comments, articles, and other 
                  submissions. You warrant that your content does not violate any laws or infringe on any third-party rights.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">4.2 Content License</h3>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  By posting content on our website, you grant us a worldwide, non-exclusive, royalty-free license 
                  to use, reproduce, modify, and display your content in connection with operating our services.
                </p>

                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">4.3 Content Moderation</h3>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  We reserve the right to remove any content that violates these Terms or is deemed inappropriate 
                  at our sole discretion. We are not obligated to monitor user content but may do so.
                </p>
              </section>

              {/* 5. Intellectual Property */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">5. Intellectual Property</h2>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  All content on {settings.site_name || 'Policy Drift News'}, including articles, images, logos, and design elements, is 
                  protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  You may not reproduce, distribute, or create derivative works from our content without express 
                  written permission. Fair use for personal, non-commercial purposes is permitted with proper attribution.
                </p>
                {settings.license_type && (
                  <p className="mb-4 text-slate-600 dark:text-slate-300">
                    <strong>License:</strong> {settings.license_type}
                  </p>
                )}
                {settings.disclaimer && (
                  <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-0">
                      <strong>Disclaimer:</strong> {settings.disclaimer}
                    </p>
                  </div>
                )}
              </section>

              {/* 6. Disclaimer of Warranties */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">6. Disclaimer of Warranties</h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  OUR WEBSITE AND SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                  EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT OUR WEBSITE WILL BE UNINTERRUPTED, ERROR-FREE, 
                  OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
                </p>
              </section>

              {/* 7. Limitation of Liability */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">7. Limitation of Liability</h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, {(settings.company_name || settings.site_name || 'POLICY DRIFT NEWS').toUpperCase()} SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF OUR WEBSITE, 
                  EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                </p>
              </section>

              {/* 8. Indemnification */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">8. Indemnification</h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  You agree to indemnify and hold harmless {settings.company_name || settings.site_name || 'Policy Drift News'} and its affiliates from any claims, 
                  losses, damages, liabilities, and expenses arising out of your use of our website or violation 
                  of these Terms of Service.
                </p>
              </section>

              {/* 9. Third-Party Links */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">9. Third-Party Links</h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  Our website may contain links to third-party websites. We are not responsible for the content, 
                  privacy practices, or terms of service of these third-party sites.
                </p>
              </section>

              {/* 10. Governing Law */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">10. Governing Law</h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  These Terms of Service shall be governed by and construed in accordance with the laws of{' '}
                  {settings.legal_jurisdiction || 'the jurisdiction in which we operate'}, without regard to its conflict of law principles.
                </p>
                {settings.legal_governing_law && (
                  <p className="mb-4 text-slate-600 dark:text-slate-300">
                    <strong>Governing Law:</strong> {settings.legal_governing_law}
                  </p>
                )}
              </section>

              {/* 11. Dispute Resolution */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">11. Dispute Resolution</h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  Any disputes arising from these Terms of Service shall be resolved through binding arbitration 
                  in accordance with the arbitration rules of the applicable jurisdiction. You waive your right 
                  to participate in class action lawsuits.
                </p>
              </section>

              {/* 12. Changes to Terms */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">12. Changes to Terms</h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  We reserve the right to modify these Terms of Service at any time. We will notify users of 
                  significant changes by posting a notice on our website. Your continued use of the website after 
                  changes constitute acceptance of the modified terms.
                </p>
              </section>

              {/* 13. Severability */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">13. Severability</h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  If any provision of these Terms is found to be unenforceable, the remaining provisions shall 
                  continue in full force and effect.
                </p>
              </section>

              {/* 14. Contact Information */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">14. Contact Information</h2>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="mb-2 text-slate-700 dark:text-slate-300"><strong>Email:</strong> {settings.contact_email || 'legal@policydrift.news'}</p>
                  <p className="mb-0 text-slate-700 dark:text-slate-300"><strong>Website:</strong> <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Form</a></p>
                </div>
              </section>

              {/* Acceptance */}
              <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-bold mb-3 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Agreement
                </h3>
                <p className="text-blue-800 dark:text-blue-200 mb-0">
                  By using {settings.site_name || 'Policy Drift News'}, you acknowledge that you have read, understood, and agree to be 
                  bound by these Terms of Service and our Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
