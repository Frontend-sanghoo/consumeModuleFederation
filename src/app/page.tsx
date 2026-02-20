import { Suspense } from 'react';
import RemoteComponents from './RemoteComponents';

export default function Home() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: '24px' }}>Consume Module Federation App</h1>
      <p style={{ marginBottom: '24px', color: '#6b7280' }}>
        이 앱은 S3에서 원격 컴포넌트를 SSR로 로드합니다.
      </p>

      <Suspense fallback={<div>Loading remote components...</div>}>
        <RemoteComponents />
      </Suspense>
    </div>
  );
}
