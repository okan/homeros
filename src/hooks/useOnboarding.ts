import { useState, useEffect } from 'react';

const STORAGE_KEY = 'homeros_onboarding_completed';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        const hasCompleted = result[STORAGE_KEY] === true;
        setShowOnboarding(!hasCompleted);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        setShowOnboarding(false);
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  const completeOnboarding = async () => {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: true });
      setShowOnboarding(false);
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  return {
    showOnboarding,
    isLoading,
    completeOnboarding,
  };
};
