/// <reference types="vite/client" />

interface ImportMetaEnv {
  // readonly VITE_SOME_VAR: string;
  readonly VITE_DATABASE: string;
  readonly VITE_DATABASE_USER: string;
  readonly VITE_DATABASE_PASSWORD: string;
  readonly VITE_JWT_SECRET: string;
  readonly VITE_JWT_EXPIRES_IN: string;

  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
