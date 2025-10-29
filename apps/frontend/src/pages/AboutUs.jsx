import { useSEO } from '../hooks/useSEO';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import Loading from '../components/ui/Loading';

const AboutUs = () => {
  const { settings, loading } = useSiteSettings();

  useSEO({
    title: `About Us - ${settings.site_name || 'Policy Drift News'}`,
    description: settings.about_subtitle || 'Learn about our mission to deliver accurate, unbiased news coverage, and our commitment to journalistic excellence.',
    keywords: 'about us, news organization, journalism, media, news team',
    url: `${window.location.origin}/about`,
    type: 'website'
  });

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        {settings.about_hero_image && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${settings.about_hero_image})` }}
          />
        )}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {settings.about_title || `About ${settings.site_name || 'Policy Drift News'}`}
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              {settings.about_subtitle || settings.tagline || 'Delivering Truth, Transparency, and Timely News Since 2025'}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Our Mission</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {settings.company_mission || `To provide accurate, unbiased, and comprehensive news coverage that empowers our readers 
                to make informed decisions. We are committed to journalistic integrity, fact-checking, 
                and presenting diverse perspectives on the issues that matter most.`}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
              <div className="text-5xl mb-4">🔭</div>
              <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Our Vision</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {settings.company_vision || `To become a trusted global news platform that bridges information gaps, fosters critical 
                thinking, and promotes civic engagement. We envision a world where quality journalism 
                is accessible to everyone, regardless of location or background.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-slate-100 dark:bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center text-slate-900 dark:text-white">
              Our Story
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg">
                {settings.about_story ? (
                  <div 
                    className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{ __html: settings.about_story.replace(/\n/g, '<br/>') }}
                  />
                ) : (
                  <>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      {settings.site_name || 'Policy Drift News'} was founded in {settings.company_founded_year || '2025'} with a simple yet powerful mission: to cut through 
                      the noise and deliver news that matters. In an era of information overload and misinformation, 
                      we recognized the need for a news platform that prioritizes accuracy, context, and reader trust.
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      Our team of experienced journalists, editors, and content creators work tirelessly to bring 
                      you stories from around the world. We believe in the power of well-researched journalism to 
                      educate, inform, and inspire positive change in society.
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      From breaking news to in-depth analysis, from local stories to global trends, we cover the 
                      topics that shape our world. Our commitment to editorial independence and ethical journalism 
                      guides every story we publish.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center text-slate-900 dark:text-white">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Accuracy</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Every fact is verified, every source is vetted, and every story is thoroughly fact-checked 
                before publication.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Impartiality</h3>
              <p className="text-slate-600 dark:text-slate-300">
                We present balanced perspectives and let our readers form their own informed opinions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Transparency</h3>
              <p className="text-slate-600 dark:text-slate-300">
                We're open about our editorial process, sources, and any potential conflicts of interest.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Timeliness</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Breaking news delivered promptly without compromising accuracy or depth of coverage.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Community</h3>
              <p className="text-slate-600 dark:text-slate-300">
                We foster meaningful dialogue and engagement with our readers and the communities we serve.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Ethics</h3>
              <p className="text-slate-600 dark:text-slate-300">
                We adhere to the highest standards of journalistic ethics and professional conduct.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Standards */}
      <section className="py-16 bg-slate-100 dark:bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 text-center text-slate-900 dark:text-white">
              Editorial Standards
            </h2>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">✓</span>
                  Fact-Checking Process
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  All articles undergo rigorous fact-checking by our editorial team. We verify information 
                  through multiple reliable sources and clearly distinguish between facts and opinions.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">✓</span>
                  Source Attribution
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  We always credit our sources and provide links to original documents, studies, and statements 
                  whenever possible. Anonymous sources are used only when necessary and with proper verification.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">✓</span>
                  Corrections Policy
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  We promptly correct any errors in our reporting. Corrections are clearly marked and 
                  transparently communicated to our readers.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">✓</span>
                  Editorial Independence
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {settings.editorial_standards || `Our editorial decisions are made independently, free from commercial, political, or other 
                  external influences. Sponsored content is clearly labeled as such.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-12 shadow-lg">
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
              Get in Touch
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Have questions, suggestions, or story tips? We'd love to hear from you.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              Contact Us
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
