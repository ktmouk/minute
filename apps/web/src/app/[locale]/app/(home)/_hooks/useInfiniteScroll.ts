import { useRef, useEffect, useMemo } from "react";

export const useInfiniteScroll = (onReachEnd: () => void) => {
  const observerRef = useRef<HTMLSpanElement | null>(null);

  const observer = useMemo(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    return new IntersectionObserver(
      (entry) => {
        if (entry[0]?.isIntersecting === true) {
          onReachEnd();
        }
      },
      { threshold: 1 },
    );
  }, [onReachEnd]);

  useEffect(() => {
    const ref = observerRef.current;
    if (ref !== null) {
      observer?.observe(ref);
    }
    return () => {
      if (ref !== null) {
        observer?.unobserve(ref);
      }
    };
  }, [observer, observerRef]);

  return {
    observerRef,
  };
};
