'use client';

import dynamic from 'next/dynamic';

// Keep the browser-only globe out of server rendering.
const AccessGlobe = dynamic(() => import('./AccessGlobe'), { ssr: false });

export default AccessGlobe;
