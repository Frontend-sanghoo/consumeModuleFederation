import Script from 'next/script';

const S3_BUCKET_URL = 's3버킷이름';

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
        {/* 클라이언트용 remoteEntry.js 미리 로드 */}
        <Script
          src={`${S3_BUCKET_URL}/client/remoteEntry.js`}
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
