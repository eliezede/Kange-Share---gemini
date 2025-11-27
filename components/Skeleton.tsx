
import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

export const HostCardSkeleton: React.FC<{ isCompact?: boolean }> = ({ isCompact }) => (
    <div className={`
        bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm
        ${isCompact ? 'w-64 flex-shrink-0 mr-4' : 'w-full'}
    `}>
        <div className="p-4 flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-12" />
                </div>
            </div>
        </div>
        {!isCompact && (
            <div className="px-4 pb-4">
                <Skeleton className="h-10 w-full rounded-xl" />
            </div>
        )}
    </div>
);

export const RequestCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3 w-full">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 mb-4 grid grid-cols-2 gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
        </div>
        <div className="flex gap-2">
            <Skeleton className="h-9 flex-1 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
    </div>
);
