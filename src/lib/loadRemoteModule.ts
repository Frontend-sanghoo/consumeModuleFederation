const S3_BUCKET_URL = 'https://module-federation-test.mnpp.cc/module-federation';

type ModuleScope = {
  [key: string]: {
    get: (module: string) => Promise<() => unknown>;
    init: (shareScope: unknown) => Promise<void>;
  };
};

declare const __webpack_init_sharing__: (scope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: unknown };

// 서버 사이드 모듈 캐시
const serverModuleCache: Record<string, unknown> = {};

// 클라이언트 사이드 모듈 캐시
const clientModuleCache: Record<string, unknown> = {};

// 서버 사이드에서 원격 모듈 로드 (fetch 사용)
async function loadRemoteModuleServer<T>(moduleName: string): Promise<T> {
  // 캐시에서 전체 모듈을 가져옴
  if (!serverModuleCache['__remoteEntry__']) {
    const remoteUrl = `${S3_BUCKET_URL}/server/remoteEntry.js`;

    try {
      const response = await fetch(remoteUrl);
      const scriptContent = await response.text();

      // require 함수 정의
      const moduleRequire = (id: string) => {
        if (id === 'react') return require('react');
        if (id === 'react-dom') return require('react-dom');
        if (id === 'react/jsx-runtime') return require('react/jsx-runtime');
        throw new Error(`Unknown module: ${id}`);
      };

      // webpack IIFE가 module.exports를 사용하므로 wrapper로 감싸기
      const wrappedScript = `
        (function(require) {
          var module = { exports: {} };
          var exports = module.exports;
          ${scriptContent}
          return module.exports;
        })
      `;

      // eslint-disable-next-line no-eval
      const moduleFactory = eval(wrappedScript);
      const remoteModule = moduleFactory(moduleRequire);

      serverModuleCache['__remoteEntry__'] = remoteModule;
    } catch (error) {
      console.error(`Failed to load remote module:`, error);
      throw error;
    }
  }

  const remoteModule = serverModuleCache['__remoteEntry__'] as Record<string, unknown>;

  // ./Button -> Button, ./Card -> Card
  const componentName = moduleName.replace('./', '');
  const component = remoteModule[componentName];

  if (!component) {
    throw new Error(`Component ${componentName} not found in remote module. Available: ${Object.keys(remoteModule).join(', ')}`);
  }

  return { default: component } as T;
}

// 클라이언트 사이드에서 원격 모듈 로드
async function loadRemoteModuleClient<T>(moduleName: string): Promise<T> {
  const cacheKey = `client:${moduleName}`;

  if (clientModuleCache[cacheKey]) {
    return clientModuleCache[cacheKey] as T;
  }

  // webpack의 share scope 초기화
  await __webpack_init_sharing__('default');

  const container = (window as unknown as { exportApp: ModuleScope['exportApp'] })
    .exportApp;

  if (!container) {
    throw new Error(
      'Remote container not found. Make sure remoteEntry.js is loaded.'
    );
  }

  // 컨테이너 초기화
  await container.init(__webpack_share_scopes__.default);

  // 모듈 가져오기
  const factory = await container.get(moduleName);
  const Module = factory();

  clientModuleCache[cacheKey] = Module;
  return Module as T;
}

// 환경에 따라 적절한 로더 사용
export async function loadRemoteModule<T>(moduleName: string): Promise<T> {
  if (typeof window === 'undefined') {
    return loadRemoteModuleServer<T>(moduleName);
  }
  return loadRemoteModuleClient<T>(moduleName);
}

export default loadRemoteModule;
