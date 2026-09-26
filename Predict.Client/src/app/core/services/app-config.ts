import { InjectionToken } from '@angular/core';

export interface AppConfig {
  loanEncryptionKeyBase64: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
