import { memo } from "react";
import { useVisualTheme } from "../../contexts/VisualThemeContext";

const NewsCardSkeleton = memo(function NewsCardSkeleton() {
  const { visualTheme } = useVisualTheme();

  const skeletonClass =
    visualTheme === "warm"
      ? "bg-warm-200 dark:bg-warm-700"
      : "bg-gray-200 dark:bg-gray-700";

  const borderClass =
    visualTheme === "warm"
      ? "border-b border-warm-200/50 dark:border-warm-700/50"
      : "border-b border-gray-100 dark:border-gray-700";

  return (
    <div className={`p-3 ${borderClass}`}>
      <div className="flex gap-3">
        <div
          className={`w-[60px] h-[60px] flex-shrink-0 animate-shimmer ${skeletonClass} ${
            visualTheme === "warm" ? "rounded-xl" : "rounded-lg"
          }`}
        />
        <div className="flex-1 space-y-2">
          <div
            className={`h-4 w-full rounded ${skeletonClass} animate-shimmer`}
          />
          <div
            className={`h-4 w-3/4 rounded ${skeletonClass} animate-shimmer`}
          />
          <div
            className={`h-3 w-1/3 rounded ${skeletonClass} animate-shimmer`}
          />
          <div
            className={`h-3 w-full rounded ${skeletonClass} animate-shimmer`}
          />
        </div>
      </div>
    </div>
  );
});

function NewsCardSkeletonList() {
  return (
    <>
      <NewsCardSkeleton />
      <NewsCardSkeleton />
      <NewsCardSkeleton />
    </>
  );
}

export { NewsCardSkeleton, NewsCardSkeletonList };
export default NewsCardSkeletonList;
