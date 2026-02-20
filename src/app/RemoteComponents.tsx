'use client';

import { useEffect, useState, ComponentType } from 'react';
import loadRemoteModule from '../lib/loadRemoteModule';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export default function RemoteComponents() {
  const [RemoteButton, setRemoteButton] = useState<ComponentType<ButtonProps> | null>(null);
  const [RemoteCard, setRemoteCard] = useState<ComponentType<CardProps> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadComponents() {
      try {
        const [buttonModule, cardModule] = await Promise.all([
          loadRemoteModule<{ default: ComponentType<ButtonProps> }>('./Button'),
          loadRemoteModule<{ default: ComponentType<CardProps> }>('./Card'),
        ]);

        setRemoteButton(() => buttonModule.default);
        setRemoteCard(() => cardModule.default);
      } catch (err) {
        console.error('Failed to load remote components:', err);
        setError(err instanceof Error ? err.message : 'Failed to load components');
      } finally {
        setIsLoading(false);
      }
    }

    loadComponents();
  }, []);

  if (isLoading) {
    return <div>Loading remote components...</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'red', padding: '16px', border: '1px solid red', borderRadius: '8px' }}>
        Error: {error}
      </div>
    );
  }

  if (!RemoteButton || !RemoteCard) {
    return <div>Components not available</div>;
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <RemoteButton onClick={() => alert('Remote Primary clicked!')}>
          Remote Primary Button
        </RemoteButton>
        <RemoteButton variant="secondary" onClick={() => alert('Remote Secondary clicked!')}>
          Remote Secondary Button
        </RemoteButton>
      </div>

      <RemoteCard title="원격 카드 컴포넌트">
        이 Card는 S3에서 로드된 원격 컴포넌트입니다!
      </RemoteCard>
    </>
  );
}
