/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // أضف المزيد من المتغيرات هنا إن احتجت
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
