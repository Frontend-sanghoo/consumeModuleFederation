const S3_BUCKET_URL = 's3버킷이름';

type ModuleScope = {
  [key: string]: {
    get: (module: string) => Promise<() => unknown>;
    init: (shareScope: unknown) => Promise<void>;
  };
};

declare const __webpack_init_sharing__: (scope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: unknown };

// 클라이언트 사이드 모듈 캐시
const moduleCache: Record<string, unknown> = {};

// 서버 사이드에서 원격 모듈 로드 (fetch 사용)
async function loadRemoteModuleServer<T>(
  moduleName: string
): Promise<T> {
  const cacheKey = `server:${moduleName}`;

  if (moduleCache[cacheKey]) {
    return moduleCache[cacheKey] as T;
  }

  const remoteUrl = `${S3_BUCKET_URL}/server/remoteEntry.js`;

  try {
    // Node.js에서 원격 모듈 로드
    const response = await fetch(remoteUrl);
    const scriptContent = await response.text();

    // 모듈 실행을 위한 가상 환경 생성
    const moduleExports: Record<string, unknown> = {};
    const moduleRequire = (id: string) => {
      if (id === 'react') return require('react');
      if (id === 'react-dom') return require('react-dom');
      throw new Error(`Unknown module: ${id}`);
    };

    // CommonJS 모듈로 실행
    const moduleFunc = new Function(
      'module',
      'exports',
      'require',
      scriptContent
    );

    const module = { exports: moduleExports };
    moduleFunc(module, moduleExports, moduleRequire);

    const container = module.exports as ModuleScope['exportApp'];

    // share scope 초기화
    await container.init({
      react: {
        [require('react').version]: {
          get: () => Promise.resolve(() => require('react')),
          loaded: true,
          from: 'consumeApp',
        },
      },
      'react-dom': {
        [require('react-dom').version]: {
          get: () => Promise.resolve(() => require('react-dom')),
          loaded: true,
          from: 'consumeApp',
        },
      },
    });

    // 모듈 가져오기
    const factory = await container.get(moduleName);
    const Module = factory();

    moduleCache[cacheKey] = Module;
    return Module as T;
  } catch (error) {
    console.error(`Failed to load remote module ${moduleName}:`, error);
    throw error;
  }
}

// 클라이언트 사이드에서 원격 모듈 로드
async function loadRemoteModuleClient<T>(
  moduleName: string
): Promise<T> {
  const cacheKey = `client:${moduleName}`;

  if (moduleCache[cacheKey]) {
    return moduleCache[cacheKey] as T;
  }

  // webpack의 share scope 초기화
  await __webpack_init_sharing__('default');

  const container = (window as unknown as { exportApp: ModuleScope['exportApp'] }).exportApp;

  if (!container) {
    throw new Error('Remote container not found. Make sure remoteEntry.js is loaded.');
  }

  // 컨테이너 초기화
  await container.init(__webpack_share_scopes__.default);

  // 모듈 가져오기
  const factory = await container.get(moduleName);
  const Module = factory();

  moduleCache[cacheKey] = Module;
  return Module as T;
}

// 환경에 따라 적절한 로더 사용
export async function loadRemoteModule<T>(
  moduleName: string
): Promise<T> {
  if (typeof window === 'undefined') {
    return loadRemoteModuleServer<T>(moduleName);
  }
  return loadRemoteModuleClient<T>(moduleName);
}

export default loadRemoteModule;
