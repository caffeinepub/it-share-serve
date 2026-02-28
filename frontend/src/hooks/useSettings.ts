import { useState, useCallback } from 'react';

export interface AppSettings {
  darkMode: boolean;
  notifications: boolean;
  autoplayVideos: boolean;
}

const SETTINGS_KEY = 'shareserver_settings';

const defaultSettings: AppSettings = {
  darkMode: true,
  notifications: true,
  autoplayVideos: false,
};

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return defaultSettings;
}

function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  const toggleSetting = useCallback((key: keyof AppSettings) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveSettings(next);
      return next;
    });
  }, []);

  return { settings, updateSetting, toggleSetting };
}
