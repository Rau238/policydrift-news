import { useEffect, useState } from 'react';

/**
 * Google AdSense Component
 * 
 * Usage:
 * <AdSense 
 *   adSlot="1234567890"
 *   adFormat="auto"
 *   fullWidthResponsive={true}
 * />
 */

const AdSense = ({ 
  adSlot, 
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' }
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    try {
      // Check if adsbygoogle is available
      if (window.adsbygoogle && window.adsbygoogle.loaded) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      } else {
        // Wait for script to load
        const checkAdsense = setInterval(() => {
          if (window.adsbygoogle) {
            clearInterval(checkAdsense);
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            setAdLoaded(true);
          }
        }, 100);

        // Cleanup after 5 seconds if not loaded (likely blocked)
        setTimeout(() => {
          clearInterval(checkAdsense);
          if (!window.adsbygoogle) {
            setAdError(true);
          }
        }, 5000);

        return () => clearInterval(checkAdsense);
      }
    } catch (error) {
      console.warn('AdSense error:', error);
      setAdError(true);
    }
  }, []);

  // If ad is blocked, show placeholder instead of breaking layout
  if (adError) {
    return (
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 text-center border-2 border-dashed border-slate-300 dark:border-slate-600">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Advertisement
        </p>
      </div>
    );
  }

  return (
    <div className="my-4">
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-1508845535613236"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
};

export default AdSense;
