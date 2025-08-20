// ============================================================================
// SPONSOR WALL CUSTOM HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { Company, SlotType, EngagementData } from '../types/sponsor-wall';
import { formatTimeRemaining } from '../lib/utils';

// ============================================================================
// USE SPONSOR ROTATION HOOK
// ============================================================================

export const useSponsorRotation = (
  companies: Company[],
  rotationSpeed: number = 3, // seconds per company
  autoRotate: boolean = true
) => {
  const [currentCompanyIndex, setCurrentCompanyIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(rotationSpeed);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const rotateToNextCompany = useCallback(() => {
    if (companies.length === 0) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentCompanyIndex((prev) => (prev + 1) % companies.length);
      setTimeRemaining(rotationSpeed);
      setIsTransitioning(false);
    }, 500);
  }, [companies.length, rotationSpeed]);

  const rotateToCompany = useCallback((index: number) => {
    if (index < 0 || index >= companies.length) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentCompanyIndex(index);
      setTimeRemaining(rotationSpeed);
      setIsTransitioning(false);
    }, 500);
  }, [companies.length, rotationSpeed]);

  const pauseRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resumeRotation = useCallback(() => {
    if (autoRotate && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            rotateToNextCompany();
            return rotationSpeed;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [autoRotate, rotateToNextCompany, rotationSpeed]);

  useEffect(() => {
    if (autoRotate) {
      resumeRotation();
    }
    return () => pauseRotation();
  }, [autoRotate, resumeRotation, pauseRotation]);

  const currentCompany = companies[currentCompanyIndex] || null;
  const progress = ((rotationSpeed - timeRemaining) / rotationSpeed) * 100;

  return {
    currentCompany,
    currentCompanyIndex,
    isTransitioning,
    timeRemaining,
    progress,
    rotateToNextCompany,
    rotateToCompany,
    pauseRotation,
    resumeRotation,
  };
};

// ============================================================================
// USE AUCTION TIMER HOOK
// ============================================================================

export const useAuctionTimer = (
  initialTime: number,
  onTimeUp?: () => void,
  autoStart: boolean = true
) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isActive, setIsActive] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTimeRemaining(initialTime);
    setIsActive(false);
    setIsPaused(false);
  }, [initialTime]);

  const setTime = useCallback((seconds: number) => {
    setTimeRemaining(seconds);
  }, []);

  useEffect(() => {
    if (isActive && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, timeRemaining, onTimeUp]);

  const formattedTime = formatTimeRemaining(timeRemaining);
  const isWarning = timeRemaining <= 300; // 5 minutes
  const isCritical = timeRemaining <= 60; // 1 minute

  return {
    timeRemaining,
    formattedTime,
    isActive,
    isPaused,
    isWarning,
    isCritical,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setTime,
  };
};

// ============================================================================
// USE ENGAGEMENT TRACKING HOOK
// ============================================================================

export const useEngagementTracking = (slotNumber: number, slotType: SlotType) => {
  const [engagementData, setEngagementData] = useState<EngagementData>({
    slotNumber,
    slotType,
    totalInteractions: 0,
    uniqueUsers: 0,
    qrScans: 0,
    nfcTaps: 0,
    contentViews: 0,
    contentLikes: 0,
    contentShares: 0,
    averageSessionTime: 0,
    conversionRate: 0,
    lastInteraction: new Date(),
    topInteractions: [],
    dailyStats: [],
  });

  const trackInteraction = useCallback((type: string) => {
    setEngagementData((prev) => {
      const now = new Date();
      const newInteraction = {
        type,
        count: 1,
        timestamp: now,
      };

      const updatedTopInteractions = [
        newInteraction,
        ...prev.topInteractions.slice(0, 9), // Keep last 10
      ];

      return {
        ...prev,
        totalInteractions: prev.totalInteractions + 1,
        lastInteraction: now,
        topInteractions: updatedTopInteractions,
        ...(type === 'qr_scan' && { qrScans: prev.qrScans + 1 }),
        ...(type === 'nfc_tap' && { nfcTaps: prev.nfcTaps + 1 }),
        ...(type === 'content_view' && { contentViews: prev.contentViews + 1 }),
        ...(type === 'content_like' && { contentLikes: prev.contentLikes + 1 }),
        ...(type === 'content_share' && { contentShares: prev.contentShares + 1 }),
      };
    });
  }, []);

  const trackUserSession = useCallback((sessionTime: number) => {
    setEngagementData((prev) => {
      const newAvgSessionTime = 
        (prev.averageSessionTime * prev.uniqueUsers + sessionTime) / (prev.uniqueUsers + 1);
      
      return {
        ...prev,
        uniqueUsers: prev.uniqueUsers + 1,
        averageSessionTime: newAvgSessionTime,
      };
    });
  }, []);

  const updateConversionRate = useCallback((conversions: number, total: number) => {
    const rate = total > 0 ? (conversions / total) * 100 : 0;
    setEngagementData((prev) => ({
      ...prev,
      conversionRate: rate,
    }));
  }, []);

  return {
    engagementData,
    trackInteraction,
    trackUserSession,
    updateConversionRate,
  };
};

// ============================================================================
// USE LOCAL STORAGE HOOK
// ============================================================================

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
};

// ============================================================================
// USE MEDIA QUERY HOOK
// ============================================================================

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

// ============================================================================
// USE INTERSECTION OBSERVER HOOK
// ============================================================================

export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(ref);

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [ref, options]);

  return [setRef, isIntersecting] as const;
};

// ============================================================================
// USE DEBOUNCE HOOK
// ============================================================================

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ============================================================================
// USE THROTTLE HOOK
// ============================================================================

export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}; 