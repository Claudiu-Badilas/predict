import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import * as ReceiptsActions from 'src/app/modules/receipts/actions/receipts.actions';
import * as fromReceipts from 'src/app/modules/receipts/reducers/receipts.reducer';
import { ReceiptsService_STORAGE_KEY } from 'src/app/modules/receipts/services/receipts.service';
import { ReceiptsService_MANUAL_STORAGE_KEY } from 'src/app/modules/receipts/services/receipts-settings.constants';
import {
  StorageManagerConfig,
  StorageManagerModalComponent,
} from 'src/app/shared/components/modals/storage-manager/storage-manager-modal.component';

@Component({
  selector: 'p-receipts-settings',
  imports: [StorageManagerModalComponent],
  template: `
    <p-storage-manager-modal
      [config]="config"
      (reloadRequested)="reloadData()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ReceiptsSettingsComponent {
  private readonly store = inject(Store<fromReceipts.State>);

  readonly config: StorageManagerConfig = {
    title: 'Receipt storage',
    manualStorageKey: ReceiptsService_MANUAL_STORAGE_KEY,
    automaticStorageKey: ReceiptsService_STORAGE_KEY,
    loadFailureActionType: ReceiptsActions.loadReceiptsFailure.type,
  };

  reloadData(): void {
    this.store.dispatch(ReceiptsActions.loadReceipts());
  }
}
