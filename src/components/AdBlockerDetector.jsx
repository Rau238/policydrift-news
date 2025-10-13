import { useState, useEffect } from 'react';
import { XMarkIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

/**
 * Ad Blocker Detector Component
 * Shows a friendly message when ad blocker is detected
 */

const AdBlockerDetector = () => {
  const [hasAdBlocker, setHasAdBlocker] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed the message in this session
    const dismissed = sessionStorage.getItem('adBlockerNoticeDismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const detectAdBlocker = async () => {
      try {
        // Try to fetch the AdSense script
        const response = await fetch(
          'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
          {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache',
          }
        );
        
        // If fetch succeeds without error, ad blocker might not be active
        setHasAdBlocker(false);
      } catch (error) {
        // Fetch failed, likely due to ad blocker
        setHasAdBlocker(true);
      }

      // Alternative detection: Check if window.adsbygoogle exists after delay
      setTimeout(() => {
        if (!window.adsbygoogle || window.adsbygoogle.loaded === false) {
          setHasAdBlocker(true);
        }
      }, 2000);
    };

    detectAdBlocker();
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('adBlockerNoticeDismissed', 'true');
  };

  if (!hasAdBlocker || isDismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50 animate-slide-up">
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl shadow-xl p-5">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <ShieldExclamationIcon className="w-7 h-7 text-orange-600 dark:text-orange-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-bold text-orange-900 dark:text-orange-200 text-lg">
                Ad Blocker Detected
              </h3>
              <button
                onClick={handleDismiss}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 transition-colors"
                aria-label="Dismiss"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-orange-800 dark:text-orange-300 mb-3">
              We noticed you're using an ad blocker. Our site is free and supported by advertisements. 
              Please consider whitelisting us to help us continue providing quality news content.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Got it
              </button>
              <a
                href="https://support.google.com/adsense/answer/12654?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-slate-700 text-orange-900 dark:text-orange-200 rounded-lg text-sm font-medium border border-orange-200 dark:border-orange-800 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdBlockerDetector;
