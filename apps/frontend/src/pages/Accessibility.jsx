import { useSEO } from '../hooks/useSEO';

const Accessibility = () => {
  useSEO({
    title: 'Accessibility Statement - Policy Drift News',
    description: 'Our commitment to web accessibility. Learn about accessibility features and how we ensure our website is usable by everyone.',
    keywords: 'accessibility, WCAG, web accessibility, inclusive design, assistive technology',
    url: `${window.location.origin}/accessibility`,
    type: 'website'
  });

  const lastUpdated = 'October 10, 2025';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Accessibility Statement</h1>
            <p className="text-lg text-white/90">
              Our Commitment to Inclusive Design
            </p>
            <p className="text-sm text-white/80 mt-2">
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
              
              {/* Commitment */}
              <div className="mb-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white mt-0 flex items-center gap-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Our Commitment
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-0">
                  Policy Drift News is committed to ensuring digital accessibility for people with disabilities. 
                  We are continually improving the user experience for everyone and applying the relevant accessibility standards.
                </p>
              </div>

              {/* Conformance Status */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Conformance Status</h2>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers 
                  to improve accessibility for people with disabilities. It defines three levels of conformance: 
                  Level A, Level AA, and Level AAA.
                </p>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  Policy Drift News is partially conformant with WCAG 2.1 level AA. Partially conformant means 
                  that some parts of the content do not fully conform to the accessibility standard.
                </p>
              </section>

              {/* Accessibility Features */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Accessibility Features</h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  Our website includes the following accessibility features:
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Keyboard Navigation
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      All interactive elements can be accessed and operated using keyboard only (Tab, Enter, Arrow keys).
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Screen Reader Support
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      Semantic HTML and ARIA labels ensure compatibility with screen readers like JAWS, NVDA, and VoiceOver.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      High Contrast
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      Color combinations meet WCAG AA contrast ratios. Dark mode option for reduced eye strain.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Readable Text
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      Clear typography with adequate font sizes and line spacing. Text can be resized up to 200% without loss of functionality.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Alternative Text
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      All images include descriptive alt text for users who cannot see them.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Responsive Design
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      Mobile-friendly layout that adapts to different screen sizes and orientations.
                    </p>
                  </div>
                </div>
              </section>

              {/* Technical Specifications */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Technical Specifications</h2>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  Accessibility of Policy Drift News relies on the following technologies:
                </p>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li>HTML5</li>
                  <li>WAI-ARIA</li>
                  <li>CSS3</li>
                  <li>JavaScript/React</li>
                </ul>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  These technologies are relied upon for conformance with the accessibility standards used.
                </p>
              </section>

              {/* Known Limitations */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Known Limitations</h2>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  Despite our best efforts, some limitations may exist:
                </p>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li><strong>User-generated content:</strong> Comments and user-submitted articles may not always meet accessibility standards</li>
                  <li><strong>Third-party content:</strong> Embedded videos, ads, or widgets may have accessibility limitations</li>
                  <li><strong>Older articles:</strong> Some archived content may not meet current accessibility standards</li>
                </ul>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  We are actively working to address these limitations and improve accessibility across all areas of our website.
                </p>
              </section>

              {/* Assessment Approach */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Assessment Approach</h2>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  Policy Drift News assessed the accessibility of this website using the following methods:
                </p>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li>Self-evaluation using WCAG 2.1 guidelines</li>
                  <li>Automated testing tools (WAVE, Lighthouse)</li>
                  <li>Manual testing with keyboard navigation</li>
                  <li>Screen reader testing (NVDA, VoiceOver)</li>
                  <li>User feedback from people with disabilities</li>
                </ul>
              </section>

              {/* Feedback */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Feedback and Contact</h2>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  We welcome your feedback on the accessibility of Policy Drift News. Please let us know if you 
                  encounter accessibility barriers:
                </p>
                <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-6">
                  <p className="mb-2 text-slate-700 dark:text-slate-300"><strong>Email:</strong> accessibility@policydrift.news</p>
                  <p className="mb-2 text-slate-700 dark:text-slate-300"><strong>Contact Form:</strong> <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Us</a></p>
                  <p className="mb-0 text-slate-700 dark:text-slate-300"><strong>Response Time:</strong> We aim to respond within 3 business days</p>
                </div>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  Please include the following in your report:
                </p>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li>The web page URL where you experienced the issue</li>
                  <li>A description of the accessibility barrier</li>
                  <li>Your contact information (if you'd like a response)</li>
                  <li>Assistive technology you were using (if applicable)</li>
                </ul>
              </section>

              {/* Compatibility */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Compatibility with Browsers and Assistive Technology</h2>
                <p className="mb-4 text-slate-600 dark:text-slate-300">
                  Policy Drift News is designed to be compatible with the following assistive technologies:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Screen Readers</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-300">
                      <li>• JAWS (Windows)</li>
                      <li>• NVDA (Windows)</li>
                      <li>• VoiceOver (macOS/iOS)</li>
                      <li>• TalkBack (Android)</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Browsers</h4>
                    <ul className="text-sm text-slate-600 dark:text-slate-300">
                      <li>• Chrome (latest version)</li>
                      <li>• Firefox (latest version)</li>
                      <li>• Safari (latest version)</li>
                      <li>• Edge (latest version)</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Continuous Improvement */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Continuous Improvement</h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  Accessibility is an ongoing effort. We regularly:
                </p>
                <ul className="mb-6 text-slate-600 dark:text-slate-300">
                  <li>Conduct accessibility audits</li>
                  <li>Provide accessibility training to our team</li>
                  <li>Update content to meet current standards</li>
                  <li>Test with assistive technologies</li>
                  <li>Incorporate user feedback</li>
                  <li>Monitor and fix accessibility issues</li>
                </ul>
              </section>

              {/* Formal Approval */}
              <div className="mt-12 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <h3 className="text-xl font-bold mb-3 text-green-900 dark:text-green-100">
                  Formal Approval of This Statement
                </h3>
                <p className="text-green-800 dark:text-green-200 mb-2">
                  This Accessibility Statement is approved by:
                </p>
                <p className="text-green-800 dark:text-green-200 mb-0">
                  <strong>Policy Drift News Editorial Team</strong><br />
                  Date: {lastUpdated}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Accessibility;
