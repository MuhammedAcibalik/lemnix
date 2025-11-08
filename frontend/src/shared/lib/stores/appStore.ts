/**
 * @fileoverview App State Management Store
 * @module AppStore
 * @version 1.0.0
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  // Navigation state
  activePage: string;
  sidebarOpen: boolean;
  useModernNavigation: boolean;
  
  // UI state
  loading: boolean;
  error: string | null;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
  
  // Theme state
  theme: 'light' | 'dark';
  
  // User preferences
  preferences: {
    language: string;
    notifications: boolean;
    autoSave: boolean;
  };
}

interface AppActions {
  // Navigation actions
  setActivePage: (page: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setUseModernNavigation: (use: boolean) => void;
  toggleSidebar: () => void;
  toggleModernNavigation: () => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSnackbar: (snackbar: AppState['snackbar']) => void;
  showSnackbar: (message: string, severity: AppState['snackbar']['severity']) => void;
  hideSnackbar: () => void;
  
  // Theme actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  // Preferences actions
  setPreferences: (preferences: Partial<AppState['preferences']>) => void;
  resetPreferences: () => void;
  
  // Utility actions
  reset: () => void;
}

const initialState: AppState = {
  activePage: 'home',
  sidebarOpen: false,
  useModernNavigation: false,
  loading: false,
  error: null,
  snackbar: {
    open: false,
    message: '',
    severity: 'info'
  },
  theme: 'light',
  preferences: {
    language: 'tr',
    notifications: true,
    autoSave: true
  }
};

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Navigation actions
        setActivePage: (page: string) => set({ activePage: page }),
        setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
        setUseModernNavigation: (use: boolean) => set({ useModernNavigation: use }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        toggleModernNavigation: () => set((state) => ({ useModernNavigation: !state.useModernNavigation })),
        
        // UI actions
        setLoading: (loading: boolean) => set({ loading }),
        setError: (error: string | null) => set({ error }),
        setSnackbar: (snackbar: AppState['snackbar']) => set({ snackbar }),
        showSnackbar: (message: string, severity: AppState['snackbar']['severity']) => 
          set({ 
            snackbar: { 
              open: true, 
              message, 
              severity 
            } 
          }),
        hideSnackbar: () => set((state) => ({ 
          snackbar: { ...state.snackbar, open: false } 
        })),
        
        // Theme actions
        setTheme: (theme: 'light' | 'dark') => set({ theme }),
        toggleTheme: () => set((state) => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        })),
        
        // Preferences actions
        setPreferences: (preferences: Partial<AppState['preferences']>) => 
          set((state) => ({ 
            preferences: { ...state.preferences, ...preferences } 
          })),
        resetPreferences: () => set({ preferences: initialState.preferences }),
        
        // Utility actions
        reset: () => set(initialState)
      }),
      {
        name: 'lemnix-app-store',
        partialize: (state) => ({
          theme: state.theme,
          preferences: state.preferences,
          useModernNavigation: state.useModernNavigation
        })
      }
    ),
    {
      name: 'lemnix-app-store'
    }
  )
);
