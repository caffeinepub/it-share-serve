import { useSettings } from '../hooks/useSettings';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Moon, Bell, Play, Shield, Info, Palette } from 'lucide-react';

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

function SettingRow({ icon, label, description, checked, onToggle }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}

export default function SettingsPage() {
  const { settings, toggleSetting } = useSettings();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground font-orbitron">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your app preferences</p>
      </div>

      {/* Appearance */}
      <div className="bg-card border border-border rounded-2xl px-6">
        <div className="pt-4 pb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Palette className="w-3.5 h-3.5" />
            Appearance
          </div>
        </div>
        <SettingRow
          icon={<Moon className="w-5 h-5" />}
          label="Dark Mode"
          description="Use dark theme across the app"
          checked={settings.darkMode}
          onToggle={() => toggleSetting('darkMode')}
        />
      </div>

      {/* Notifications */}
      <div className="bg-card border border-border rounded-2xl px-6">
        <div className="pt-4 pb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Bell className="w-3.5 h-3.5" />
            Notifications
          </div>
        </div>
        <SettingRow
          icon={<Bell className="w-5 h-5" />}
          label="Push Notifications"
          description="Receive alerts for new messages and contact requests"
          checked={settings.notifications}
          onToggle={() => toggleSetting('notifications')}
        />
      </div>

      {/* Media */}
      <div className="bg-card border border-border rounded-2xl px-6">
        <div className="pt-4 pb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Play className="w-3.5 h-3.5" />
            Media
          </div>
        </div>
        <SettingRow
          icon={<Play className="w-5 h-5" />}
          label="Autoplay Videos"
          description="Automatically play videos when they appear in your feed"
          checked={settings.autoplayVideos}
          onToggle={() => toggleSetting('autoplayVideos')}
        />
      </div>

      {/* About */}
      <div className="bg-card border border-border rounded-2xl px-6">
        <div className="pt-4 pb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Info className="w-3.5 h-3.5" />
            About
          </div>
        </div>
        <div className="py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm font-medium text-foreground">1.0.0</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Platform</span>
            <span className="text-sm font-medium text-foreground">Internet Computer</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Built with</span>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </div>

      {/* Privacy note */}
      <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
        <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Your settings are stored locally on your device and are never sent to any server.
        </p>
      </div>
    </div>
  );
}
