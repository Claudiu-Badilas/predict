import { Injectable } from '@angular/core';
import { LocalStorageService } from 'src/app/platform/services/local-storage.service';

@Injectable({ providedIn: 'root' })
export class StorageSettingsService {
  constructor(private readonly localStorage: LocalStorageService) {}

  uploadStorageItemFromJson(storageKey: string, file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (file.type !== 'application/json') {
        reject(new Error('Invalid file type. Please upload a JSON file.'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const jsonContent = event.target?.result as string;
          const data: unknown = JSON.parse(jsonContent);

          if (!Array.isArray(data)) {
            reject(new Error('JSON file must contain an array.'));
            return;
          }

          this.localStorage.setItem(storageKey, data);
          resolve(true);
        } catch (error) {
          reject(
            new Error(`Failed to parse JSON file: ${(error as Error).message}`),
          );
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    });
  }

  downloadItem(item: { key: string; storageType: 'local' | 'session' }): void {
    const storage =
      item.storageType === 'local' ? localStorage : sessionStorage;
    const value = storage.getItem(item.key);

    if (!value) {
      alert('No data found for this key');
      return;
    }

    const blob = new Blob([value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${item.key}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
