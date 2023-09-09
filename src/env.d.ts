/// <reference types="vite/client" />

interface ImportMetaEnv {
  // readonly VITE_SOME_VAR: string;
  readonly VITE_DATABASE: string;
  readonly VITE_DATABASE_USER: string;
  readonly VITE_DATABASE_PASSWORD: string;

  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
