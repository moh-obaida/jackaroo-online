/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_DATABASE_URL: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_ENABLE_CODE_EXPORT: string;
  readonly VITE_LEGAL_AUDIT: string;
  readonly VITE_BOARD_CALIBRATION: string;
  readonly VITE_ENABLE_BOARD_CALIBRATION: string;
  readonly VITE_BOARD_PROCEDURAL: string;
  readonly VITE_BOARD_PHYSICAL: string;
}
