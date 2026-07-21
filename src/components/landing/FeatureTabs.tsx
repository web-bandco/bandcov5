import { useState } from 'react';
import { Palette, Zap, LayoutGrid, Newspaper, Info, CheckCircle } from 'lucide-react';
import { VerticalTabs, type VerticalTab } from '@/components/ui/overlay/VerticalTabs';

interface TabContent {
  title: string;
  content: string;
}

const tabContent: Record<string, TabContent> = {
  theming: {
    title: 'Brighton and Co Version 5',
    content: "Based on the Velocity template by Southwell Media. This theme leverages a large number of pre-built components, which are then tailored to Brighton and Co.",
  },
  perf: {
    title: 'Performance - Better and Faster',
    content: "Brighton and Co Version 5 uses pre-built components, built to be as lightweight and efficient as possible, whilst remaining fully accessible to every user.",
  },
  components: {
    title: 'A Range of Visual Changes',
    content: 'With Brighton and Co Version 5, the site has a completely refreshed look and feel, with more fluid animations. Moreover, a more comprehensive design system provides a more uniform and cohesive website design.',
  },
  content: {
    title: 'More Potential',
    content: 'The potential for more content and features for the site is seemingly exponentially increased with the Velocity theme template. Blog posts in particular will benefit from this new design.',
  },
};

const tabs: VerticalTab[] = [
  { id: 'theming', label: 'B&Co Version 5', description: 'Major changes with v5', icon: Info },
  { id: 'perf', label: 'Performance', description: 'Faster performance', icon: Zap },
  { id: 'components', label: 'Visual Changes', description: 'Better visual design and UI changes', icon: LayoutGrid },
  { id: 'content', label: 'More Potential', description: 'More features, content and future developments', icon: Newspaper },
];

export function FeatureTabs() {
  const [activeTab, setActiveTab] = useState('theming');

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-display text-foreground text-2xl font-bold md:text-3xl">
          The latest from: <br />
          <span className="text-brand-700">Brighton and Co</span>
        </h2>
        <p className="text-foreground-muted mt-3 text-base">
          Below are the latest features, updates and improvements made to the site. New features are constantly being added and refined.
        </p>
      </div>

      {/* Vertical Tabs */}
      <VerticalTabs tabs={tabs} value={activeTab} onChange={setActiveTab} mobileVariant="sheet">
        {tabs.map((tab) => (
          <div key={tab.id} data-tab-content={tab.id} className="h-full">
            {/* ✅ Added the card wrapper classes right here! */}
            <div className="p-6 md:p-8 border border-border bg-surface-secondary/50 rounded-lg border border-border">
              <h3 className="text-foreground text-xl font-bold">{tabContent[tab.id].title}</h3>
              <p className="text-foreground-muted mt-3 leading-relaxed">{tabContent[tab.id].content}</p>
            </div>
          </div>
        ))}
      </VerticalTabs>
    </div>
  );
}

export default FeatureTabs;