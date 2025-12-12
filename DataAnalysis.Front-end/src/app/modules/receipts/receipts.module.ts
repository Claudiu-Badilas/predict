import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import * as fromReceipts from 'src/app/modules/receipts/reducers/receipts.reducer';
import { RangeSelectorComponent } from 'src/app/shared/components/date-range-picker/date-range-picker.component';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
import { ReceiptListComponent } from './components/receipts-list/receipts-list/receipts-list.component';
import { ReceiptsEffects } from './effects/receipts.effects';
import { ReceiptsComponent } from './receipts.component';
import { ReceiptsRoutingModule } from './receipts.routing';
import { ReceiptsService } from './services/receipts.service';

@NgModule({
  imports: [
    CommonModule,
    ReceiptsRoutingModule,
    NgbModule,
    SideBarModule,
    StoreModule.forFeature('ReceiptsState', fromReceipts.reducer),
    EffectsModule.forFeature([ReceiptsEffects]),
    ReceiptListComponent,
    RangeSelectorComponent,
  ],
  declarations: [ReceiptsComponent],
  exports: [ReceiptsComponent],
  providers: [ReceiptsService],
})
export class ReceiptsModule {}
