// 원격 모듈 타입 정의
declare module 'exportApp/Button' {
  import { FC, ReactNode } from 'react';

  interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
  }

  const Button: FC<ButtonProps>;
  export default Button;
}

declare module 'exportApp/Card' {
  import { FC, ReactNode } from 'react';

  interface CardProps {
    title: string;
    children: ReactNode;
  }

  const Card: FC<CardProps>;
  export default Card;
}

// Webpack Module Federation 글로벌 타입
declare const __webpack_init_sharing__: (scope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: unknown };

interface Window {
  exportApp: {
    get: (module: string) => Promise<() => unknown>;
    init: (shareScope: unknown) => Promise<void>;
  };
}
