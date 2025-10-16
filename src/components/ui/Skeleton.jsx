/**
 * Skeleton Loading Component
 * Provides skeleton screens to prevent layout shifts and improve perceived performance
 */

const Skeleton = ({ variant = 'text', className = '', count = 1, height, width }) => {
  const baseClasses = 'animate-pulse bg-gray-300 dark:bg-gray-700 rounded';
  
  const variants = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    circle: 'rounded-full',
    rectangle: 'rounded-lg',
    button: 'h-10 w-32 rounded-lg',
    card: 'h-64 w-full rounded-lg',
    image: 'aspect-video w-full rounded-lg',
    avatar: 'w-12 h-12 rounded-full',
  };

  const variantClass = variants[variant] || variants.text;
  const customStyle = {};
  
  if (height) customStyle.height = height;
  if (width) customStyle.width = width;

  const skeletonElement = (
    <div 
      className={`${baseClasses} ${variantClass} ${className}`}
      style={customStyle}
    />
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className={`${baseClasses} ${variantClass} ${className}`}
          style={customStyle}
        />
      ))}
    </div>
  );
};

/**
 * Article Card Skeleton
 * Used for loading states in article grids
 */
export const ArticleCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
    {/* Image skeleton */}
    <Skeleton variant="image" />
    
    {/* Content skeleton */}
    <div className="p-4 space-y-3">
      {/* Category badge */}
      <Skeleton variant="button" className="w-20 h-6" />
      
      {/* Title */}
      <Skeleton variant="title" count={2} />
      
      {/* Description */}
      <Skeleton variant="text" count={3} />
      
      {/* Meta info */}
      <div className="flex items-center gap-3 pt-2">
        <Skeleton variant="circle" className="w-8 h-8" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-24" />
          <Skeleton variant="text" className="w-32" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Article Detail Skeleton
 * Used for loading state in article detail page
 */
export const ArticleDetailSkeleton = () => (
  <div className="min-h-screen">
    {/* Hero section skeleton */}
    <div className="relative h-[60vh] bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="absolute inset-0 bg-black/40">
        <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          {/* Breadcrumb */}
          <div className="mb-4">
            <Skeleton variant="text" className="w-48 h-4" />
          </div>
          
          {/* Category badge */}
          <div className="mb-4">
            <Skeleton variant="button" className="w-32 h-8 bg-white/30" />
          </div>
          
          {/* Title */}
          <Skeleton variant="title" count={2} className="mb-6 bg-white/30 h-12" />
          
          {/* Meta info */}
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" className="w-12 h-12 bg-white/30" />
            <div className="space-y-2">
              <Skeleton variant="text" className="w-32 bg-white/30" />
              <Skeleton variant="text" className="w-40 bg-white/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Content skeleton */}
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4 mb-8">
          <Skeleton variant="text" count={8} />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Category Section Skeleton
 * Used for loading state in homepage category sections
 */
export const CategorySectionSkeleton = () => (
  <div className="space-y-4">
    {/* Section title */}
    <div className="flex items-center justify-between">
      <Skeleton variant="title" className="w-48 h-8" />
      <Skeleton variant="button" className="w-24 h-8" />
    </div>
    
    {/* Article grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

/**
 * List Item Skeleton
 * Used for loading states in lists
 */
export const ListItemSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
        <Skeleton variant="image" className="w-24 h-24 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" className="w-3/4" />
          <Skeleton variant="text" count={2} />
          <Skeleton variant="text" className="w-32" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Comment Skeleton
 * Used for loading states in comment sections
 */
export const CommentSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Skeleton variant="circle" className="w-10 h-10" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-32" />
            <Skeleton variant="text" count={2} />
            <Skeleton variant="text" className="w-24" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton;
