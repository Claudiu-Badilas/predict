import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import * as fromReceipts from 'src/app/modules/receipts/reducers/receipts.reducer';
import { ReceiptsEffects } from './effects/receipts.effects';
import { ReceiptsComponent } from './receipts.component';
import { ReceiptsRoutingModule } from './receipts.routing';
import { ReceiptsService } from './services/receipts.service';

@NgModule({
  imports: [
    ReceiptsRoutingModule,
    StoreModule.forFeature('ReceiptsState', fromReceipts.reducer),
    EffectsModule.forFeature([ReceiptsEffects]),
  ],
  declarations: [ReceiptsComponent],
  exports: [ReceiptsComponent],
  providers: [ReceiptsService],
})
export class ReceiptsModule {}
