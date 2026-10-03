import React from 'react';
import { useStore } from '@/lib/store';
import { Layout } from '@/components/layout';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Settings2 } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Settings() {
  const { isAccessibilityMode, preferences, updatePreference, setIsAccessibilityMode } = useStore();
  const [, setLocation] = useLocation();

  const literal = isAccessibilityMode && preferences.literalLanguage;

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto w-full pb-20">
        
        <button 
          onClick={() => setLocation('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          {literal ? "Go Back" : "Back to Home"}
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-lg text-primary">
            <Settings2 className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {literal ? "Accessibility Choices" : "Accessibility Preferences"}
          </h1>
        </div>

        <div className="bg-card border rounded-2xl p-6 space-y-8 shadow-sm">
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-lg font-semibold">Enable Cognitive Mode</Label>
              <p className="text-muted-foreground mt-1">
                Turn on the personalized cognitive layer globally.
              </p>
            </div>
            <Switch
              checked={isAccessibilityMode}
              onCheckedChange={setIsAccessibilityMode}
              className="scale-125 data-[state=checked]:bg-primary"
            />
          </div>

          {isAccessibilityMode && (
            <>
              <Separator />

              <div className="space-y-6">
                <h3 className="font-semibold text-primary uppercase tracking-wider text-sm">
                  Content Adaptations
                </h3>
                
                <PreferenceRow
                  id="literalLanguage"
                  title="Literal Language"
                  description="Replace financial jargon with simple, direct instructions."
                  checked={preferences.literalLanguage}
                  onChange={(val) => updatePreference('literalLanguage', val)}
                />
                
                <PreferenceRow
                  id="minimalInformation"
                  title="Minimal Information"
                  description="Hide secondary text, promotions, and optional details to reduce clutter."
                  checked={preferences.minimalInformation}
                  onChange={(val) => updatePreference('minimalInformation', val)}
                />

                <PreferenceRow
                  id="stepByStep"
                  title="Step-by-Step Flow"
                  description="Break down complex forms into single, focused decisions."
                  checked={preferences.stepByStep}
                  onChange={(val) => updatePreference('stepByStep', val)}
                />
              </div>

              <Separator />

              <div className="space-y-6">
                <h3 className="font-semibold text-primary uppercase tracking-wider text-sm">
                  Visual Adaptations
                </h3>

                <PreferenceRow
                  id="reducedDistractions"
                  title="Reduced Distractions"
                  description="Mute colors, hide floating elements, and simplify the interface."
                  checked={preferences.reducedDistractions}
                  onChange={(val) => updatePreference('reducedDistractions', val)}
                />

                <PreferenceRow
                  id="reducedAnimations"
                  title="Reduced Animations"
                  description="Stop interface movement and page transitions."
                  checked={preferences.reducedAnimations}
                  onChange={(val) => updatePreference('reducedAnimations', val)}
                />

                <PreferenceRow
                  id="largerText"
                  title="Larger Text"
                  description="Increase the size of all text for better readability."
                  checked={preferences.largerText}
                  onChange={(val) => updatePreference('largerText', val)}
                />

                <PreferenceRow
                  id="increasedSpacing"
                  title="Increased Spacing"
                  description="Add more space between items so they are easier to tap and read."
                  checked={preferences.increasedSpacing}
                  onChange={(val) => updatePreference('increasedSpacing', val)}
                />
              </div>
            </>
          )}

        </div>
      </div>
    </Layout>
  );
}

function PreferenceRow({ id, title, description, checked, onChange }: { 
  id: string, 
  title: string, 
  description: string, 
  checked: boolean, 
  onChange: (val: boolean) => void 
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1">
        <Label htmlFor={id} className="text-base font-medium cursor-pointer">{title}</Label>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="mt-1"
      />
    </div>
  );
}
