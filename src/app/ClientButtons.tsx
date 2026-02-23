'use client';

import { useEffect, useRef, useState } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

type MountFunction = (
  container: HTMLElement,
  props: ButtonProps
) => { unmount: () => void; update: (newProps: ButtonProps) => void };

export default function ClientButtons() {
  const primaryButtonRef = useRef<HTMLDivElement>(null);
  const secondaryButtonRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef<{
    primary?: { unmount: () => void };
    secondary?: { unmount: () => void };
  }>({});

  useEffect(() => {
    let isMounted = true;

    async function loadAndMount() {
      try {
        // remoteEntry.js가 이미 로드되었는지 확인
        const container = (window as unknown as { exportApp?: { get: (module: string) => Promise<() => unknown>; init: (shareScope: unknown) => Promise<void> } }).exportApp;

        if (!container) {
          throw new Error('Remote container not found. Make sure remoteEntry.js is loaded.');
        }

        // 컨테이너 초기화 (shared 없이 빈 객체로)
        await container.init({});

        // Mounter 모듈 가져오기 (React 포함된 격리된 버전)
        const factory = await container.get('./ButtonMounter');
        const buttonModule = factory() as { mountButton: MountFunction };

        if (!isMounted) return;

        const { mountButton } = buttonModule;

        if (!mountButton) {
          throw new Error('mountButton function not found in remote module');
        }

        // Primary 버튼 마운트
        if (primaryButtonRef.current) {
          mountedRef.current.primary = mountButton(primaryButtonRef.current, {
            children: 'Primary Button',
            onClick: () => alert('Primary clicked!'),
            variant: 'primary',
          });
        }

        // Secondary 버튼 마운트
        if (secondaryButtonRef.current) {
          mountedRef.current.secondary = mountButton(secondaryButtonRef.current, {
            children: 'Secondary Button',
            onClick: () => alert('Secondary clicked!'),
            variant: 'secondary',
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load remote button:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load button');
          setIsLoading(false);
        }
      }
    }

    loadAndMount();

    // Cleanup: 언마운트 시 원격 컴포넌트 정리
    return () => {
      isMounted = false;
      mountedRef.current.primary?.unmount();
      mountedRef.current.secondary?.unmount();
    };
  }, []);

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      {isLoading && <div>Loading buttons...</div>}
      <div ref={primaryButtonRef} style={{ display: isLoading ? 'none' : 'block' }} />
      <div ref={secondaryButtonRef} style={{ display: isLoading ? 'none' : 'block' }} />
    </div>
  );
}
