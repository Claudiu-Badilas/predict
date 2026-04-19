import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MortgageLoanService } from 'src/app/modules/mortgage-loan/services/overview-mortgage.service';

@Component({
  selector: 'p-mortgage-loan-settings',
  imports: [CommonModule],
  templateUrl: './mortgage-loan-settings.component.html',
  styleUrls: ['./mortgage-loan-settings.component.scss'],
})
export class MortgageLoanSettingsComponent implements OnInit {
  private mortgageService = inject(MortgageLoanService);

  storageKeys: {
    key: string;
    storageType: 'local' | 'session';
  }[] = [];

  ngOnInit(): void {
    this.loadKeys();
  }

  // Upload JSON file into service
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.mortgageService
      .uploadRepaymentSchedulesFromJson(file)
      .then(() => this.loadKeys())
      .catch((error) => alert(`Error: ${error.message}`));
  }

  // Load all keys from storage
  loadKeys(): void {
    this.storageKeys = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        this.storageKeys.push({
          key,
          storageType: 'local',
        });
      }
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        this.storageKeys.push({
          key,
          storageType: 'session',
        });
      }
    }
  }

  // Remove single item
  removeItem(item: { key: string; storageType: 'local' | 'session' }): void {
    const storage =
      item.storageType === 'local' ? localStorage : sessionStorage;

    storage.removeItem(item.key);
    this.loadKeys();
  }

  // Download single storage item
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

    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.key}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }
}
