import * as React from "react"
import { ExternalLink as LinkIcon } from "lucide-react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/shadcn/hover-card"

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  requireConfirm?: boolean; 
  showIndicator?: boolean;  
  disableHover?: boolean;
}

export function ExternalLink({ 
  href, 
  children, 
  className, 
  requireConfirm = true, 
  showIndicator = false, 
  disableHover = false,
  onPointerEnter,
  onPointerLeave,
  onClick,
  ...props 
}: ExternalLinkProps) {
  
  const [isHovered, setIsHovered] = React.useState(false);
  const hoverTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const domain = React.useMemo(() => {
    try { return new URL(href).hostname.replace('www.', ''); } 
    catch { return 'an external site'; }
  }, [href]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // --- 1. Silent Analytics Tracking ---
    try {
      if (typeof window !== 'undefined' && 'gtag' in window) {
        let platform = 'external_site';
        
        const lowerHref = href.toLowerCase();
        if (lowerHref.includes('vinted.')) platform = 'vinted';
        else if (lowerHref.includes('ebay.')) platform = 'ebay';
        else if (lowerHref.includes('github.')) platform = 'github';
        else if (lowerHref.includes('twitter.')) platform = 'twitter';
        else if (lowerHref.includes('linkedin.')) platform = 'linkedin';
        else if (lowerHref.includes('linktr.ee')) platform = 'linktree';

        (window as any).gtag('event', `click_${platform}`, {
          event_category: 'outbound_link',
          link_url: href,
        });
      }
    } catch (error) {
      // Fail silently - analytics should never break UX
    }

    // --- 2. Global External Link Dialog Logic ---
    if (requireConfirm) {
      e.preventDefault(); 
      e.stopPropagation(); // Stop Astro's router from interfering
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      setIsHovered(false); 
      
      // Send the signal to the global dialog instead of trying to open a local one
      window.dispatchEvent(new CustomEvent('open-external-dialog', { detail: { href } }));
    }
    
    // --- 3. Pass through original onClick ---
    if (onClick) onClick(e);
  };

  const handlePointerEnterLocal = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (disableHover || e.pointerType === 'touch') return; 
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setIsHovered(true), 200);
    if (onPointerEnter) onPointerEnter(e);
  };

  const handlePointerLeaveLocal = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (disableHover) return;
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setIsHovered(false); 
    if (onPointerLeave) onPointerLeave(e);
  };

  React.useEffect(() => {
    if (disableHover) return;
    const handleScroll = () => { if (isHovered) setIsHovered(false); };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    };
  }, [isHovered, disableHover]);

  const BaseLink = (
    <a 
      href={href} 
      onClick={handleClick} 
      onPointerEnter={handlePointerEnterLocal}
      onPointerLeave={handlePointerLeaveLocal}
      className={`inline-flex items-center gap-1 ${className || ''}`}
      target="_blank" 
      rel="noopener noreferrer" 
      {...props}
    >
      {children}
      {showIndicator && <LinkIcon className="w-3.5 h-3.5 opacity-60 relative top-[1px]" />}
    </a>
  );

  // If hover is disabled (like in the footer), we ONLY return the raw link.
  // This completely eliminates React Portal rendering issues.
  if (disableHover) return BaseLink;

  return (
    <HoverCard open={isHovered}>
      <HoverCardTrigger asChild>
        {BaseLink}
      </HoverCardTrigger>
      <HoverCardContent className="w-auto p-3 hidden md:block z-50 pointer-events-none">
        <p className="text-sm text-foreground">
          Opens an external site: <strong className="text-foreground">{domain}</strong>
        </p>
      </HoverCardContent>
    </HoverCard>
  )
}