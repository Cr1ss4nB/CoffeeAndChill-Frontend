import { useUIStore } from '@/store/ui.store';
import { useIsMobile } from '@/hooks/useIsMobile';

export function useNavLayoutToggle() {
  const isMobile = useIsMobile();
  const toggleMobileNav = useUIStore((s) => s.toggleMobileNav);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  const toggle = () => {
    if (isMobile) {
      toggleMobileNav();
    } else {
      toggleSidebar();
    }
  };

  return { toggle, isMobile };
}
