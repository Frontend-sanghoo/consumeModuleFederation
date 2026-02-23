import { ComponentType } from 'react';
import loadRemoteModule from '../lib/loadRemoteModule';
import ClientButtons from './ClientButtons';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

// 서버 컴포넌트에서 원격 모듈 로드 (SSR)
async function getRemoteCard(): Promise<ComponentType<CardProps>> {
  const module = await loadRemoteModule<{ default: ComponentType<CardProps> }>('./Card');
  return module.default;
}

export default async function Home() {
  // 서버에서 원격 컴포넌트 로드
  const RemoteCard = await getRemoteCard();

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: '24px' }}>Consume Module Federation App</h1>
      <p style={{ marginBottom: '24px', color: '#6b7280' }}>
        이 앱은 S3에서 원격 컴포넌트를 SSR로 로드합니다.
      </p>

      {/* 서버 컴포넌트에서 렌더링된 원격 Card */}
      <RemoteCard title="서버에서 렌더링된 카드">
        이 Card는 서버 컴포넌트에서 SSR로 렌더링되었습니다!
      </RemoteCard>

      {/* 클라이언트 인터랙션이 필요한 버튼 */}
      <div style={{ marginTop: '24px' }}>
        <ClientButtons />
      </div>
    </div>
  );
}
