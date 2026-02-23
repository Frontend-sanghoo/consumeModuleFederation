/** @type {import('next').NextConfig} */
const nextConfig = {
  // Module Federation Plugin 제거
  // - remoteEntry.js는 layout.tsx의 Script 태그로 로드
  // - 클라이언트는 window.exportApp을 직접 사용
  // - React는 원격 번들에 포함되어 있어 공유 불필요
};

module.exports = nextConfig;
