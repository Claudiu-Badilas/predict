import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions } from '@ngrx/effects';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs';
import { StorageSettingsService } from 'src/app/shared/services/storage-settings.service';
import { ScrollableDirective } from 'src/app/shared/directives/scrollable.directive';

export interface StorageManagerConfig {
  title: string;
  manualStorageKey: string;
  automaticStorageKey: string;
  loadFailureActionType: string;
  showAllStorage?: boolean;
  ignoredStorageKeys?: string[];
  obsoleteStorageKeys?: string[];
}

type StorageItem = {
  key: string;
  storageType: 'local' | 'session';
  origin?: 'manual' | 'automatic';
};

type ViewedStorageData = {
  key: string;
  storageType: 'local' | 'session';
  content: string;
};

@Component({
  selector: 'p-storage-manager-modal',
  imports: [CommonModule, ScrollableDirective],
  templateUrl: './storage-manager-modal.component.html',
  styleUrl: './storage-manager-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class StorageManagerModalComponent implements OnInit {
  @Input({ required: true }) config!: StorageManagerConfig;
  @Output() reloadRequested = new EventEmitter<void>();

  private readonly settingsService = inject(StorageSettingsService);
  private readonly actions = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);
  readonly activeModal = inject(NgbActiveModal, { optional: true });

  readonly errorMessage = signal<string | null>(null);
  readonly storageItems = signal<StorageItem[]>([]);
  readonly viewedData = signal<ViewedStorageData | null>(null);

  ngOnInit(): void {
    this.config.obsoleteStorageKeys?.forEach((key) =>
      localStorage.removeItem(key),
    );
    this.loadItems();
    this.actions
      .pipe(
        filter((action) => action.type === this.config.loadFailureActionType),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((action) => {
        const message = 'message' in action ? action.message : null;
        this.errorMessage.set(
          typeof message === 'string' ? message : 'Failed to load stored data.',
        );
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    input.value = '';
    this.errorMessage.set(null);
    this.settingsService
      .uploadStorageItemFromJson(this.config.manualStorageKey, file)
      .then(() => {
        this.viewedData.set(null);
        this.loadItems();
        this.reloadRequested.emit();
      })
      .catch((error: unknown) => {
        this.errorMessage.set(
          error instanceof Error ? error.message : 'Failed to upload file.',
        );
      });
  }

  loadItems(): void {
    const items: StorageItem[] = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key && this.isVisibleKey(key)) {
        items.push(this.createStorageItem(key, 'local'));
      }
    }

    for (let index = 0; index < sessionStorage.length; index++) {
      const key = sessionStorage.key(index);
      if (key && this.isVisibleKey(key)) {
        items.push(this.createStorageItem(key, 'session'));
      }
    }

    this.storageItems.set(items);
  }

  removeItem(item: StorageItem): void {
    const storage =
      item.storageType === 'local' ? localStorage : sessionStorage;

    this.errorMessage.set(null);
    try {
      storage.removeItem(item.key);
      this.viewedData.set(null);
      this.loadItems();
    } catch (error: unknown) {
      this.errorMessage.set(
        error instanceof Error
          ? error.message
          : 'Failed to remove storage item.',
      );
      return;
    }

    this.reloadRequested.emit();
  }

  viewItem(item: StorageItem): void {
    const currentView = this.viewedData();
    if (
      currentView?.key === item.key &&
      currentView.storageType === item.storageType
    ) {
      this.viewedData.set(null);
      return;
    }

    const storage =
      item.storageType === 'local' ? localStorage : sessionStorage;
    const value = storage.getItem(item.key);
    if (value === null) {
      this.errorMessage.set('No data found for this storage item.');
      this.loadItems();
      return;
    }

    this.errorMessage.set(null);
    this.viewedData.set({
      key: item.key,
      storageType: item.storageType,
      content: this.formatStorageData(value),
    });
  }

  downloadItem(item: StorageItem): void {
    this.settingsService.downloadItem(item);
  }

  private isVisibleKey(key: string): boolean {
    if (this.config.ignoredStorageKeys?.includes(key)) return false;
    if (this.config.showAllStorage) return true;

    return (
      key === this.config.manualStorageKey ||
      key === this.config.automaticStorageKey
    );
  }

  private createStorageItem(
    key: string,
    storageType: 'local' | 'session',
  ): StorageItem {
    const origin =
      key === this.config.manualStorageKey
        ? 'manual'
        : key === this.config.automaticStorageKey
          ? 'automatic'
          : undefined;
    return { key, storageType, origin };
  }

  private formatStorageData(value: string): string {
    try {
      return JSON.stringify(JSON.parse(value), null, 2) ?? value;
    } catch {
      return value;
    }
  }
}
