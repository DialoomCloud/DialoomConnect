import { useState, useEffect } from 'react';

export interface OnboardingState {
  hasSeenWelcome: boolean;
  hasSearchedHosts: boolean;
  hasUsedFilters: boolean;
  hasViewedProfile: boolean;
  hasBookedSession: boolean;
  isComplete: boolean;
}

const DEFAULT_STATE: OnboardingState = {
  hasSeenWelcome: false,
  hasSearchedHosts: false,
  hasUsedFilters: false,
  hasViewedProfile: false,
  hasBookedSession: false,
  isComplete: false
};

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);

  useEffect(() => {
    // Load state from localStorage
    const saved = localStorage.getItem('dialoom_onboarding_state');
    if (saved) {
      try {
        const parsedState = JSON.parse(saved);
        setState({ ...DEFAULT_STATE, ...parsedState });
      } catch (error) {
        console.warn('Failed to parse onboarding state:', error);
      }
    }
  }, []);

  const updateState = (updates: Partial<OnboardingState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      // Auto-complete if all steps are done
      if (!newState.isComplete && 
          newState.hasSeenWelcome && 
          newState.hasSearchedHosts && 
          newState.hasUsedFilters && 
          newState.hasViewedProfile) {
        newState.isComplete = true;
      }
      
      // Save to localStorage
      localStorage.setItem('dialoom_onboarding_state', JSON.stringify(newState));
      return newState;
    });
  };

  const resetState = () => {
    setState(DEFAULT_STATE);
    localStorage.removeItem('dialoom_onboarding_state');
  };

  const markComplete = () => {
    updateState({ isComplete: true });
  };

  return {
    state,
    updateState,
    resetState,
    markComplete
  };
}

// Helper function to check if user should see onboarding
export function shouldShowOnboarding(): boolean {
  const completedTutorial = localStorage.getItem('dialoom_onboarding_completed');
  return !completedTutorial;
}

// Track user actions for progressive disclosure
export function trackUserAction(action: keyof OnboardingState) {
  const currentState = localStorage.getItem('dialoom_onboarding_state');
  let state = DEFAULT_STATE;
  
  if (currentState) {
    try {
      state = { ...DEFAULT_STATE, ...JSON.parse(currentState) };
    } catch (error) {
      console.warn('Failed to parse onboarding state:', error);
    }
  }
  
  if (!state[action]) {
    state[action] = true;
    localStorage.setItem('dialoom_onboarding_state', JSON.stringify(state));
    
    // Trigger custom event for progressive disclosure
    window.dispatchEvent(new CustomEvent(`onboarding:${action}`, { detail: state }));
  }
}