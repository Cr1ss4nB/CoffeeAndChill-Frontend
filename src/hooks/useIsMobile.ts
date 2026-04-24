import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 767px)';

function getIsMobile() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_QUERY).matches;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mq.matches);
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
