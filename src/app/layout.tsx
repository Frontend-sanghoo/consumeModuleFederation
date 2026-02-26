import Script from 'next/script';
import './globals.css';

const S3_BUCKET_URL = 'https://module-federation-test.mnpp.cc/module-federation';

export const metadata = {
  title: 'Consume Module Federation',
  description: 'Module Federation Consumer App with SSR',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Module Federation CSS 로드 */}
        <link
          rel="stylesheet"
          href={`${S3_BUCKET_URL}/css/styles.css`}
        />
        {/* 클라이언트용 remoteEntry.js 미리 로드 */}
        <Script
          src={`${S3_BUCKET_URL}/client/remoteEntry.js`}
          strategy="beforeInteractive"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
