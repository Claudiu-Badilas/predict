import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as ReceiptsActions from 'src/app/modules/receipts/actions/receipts.actions';
import * as fromReceipts from 'src/app/modules/receipts/reducers/receipts.reducer';
import { RangeSelectorComponent } from 'src/app/shared/components/date-range-picker/date-range-picker.component';
import { SideBarModule } from 'src/app/shared/components/side-bar/side-bar.module';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import * as NavigationAction from 'src/app/store/navigation-state/navigation.actions';

@Component({
  selector: 'app-receipts-products',
  imports: [
    CommonModule,
    SideBarModule,
    RangeSelectorComponent,
    ToggleButtonComponent,
  ],
  templateUrl: './receipts-products.component.html',
  styleUrl: './receipts-products.component.scss',
})
export class ReceiptsProductsComponent {
  startDate$ = this.store
    .select(fromReceipts.getStartDate)
    .pipe(map((d) => DateUtils.fromJsDateToString(d)));
  endDate$ = this.store
    .select(fromReceipts.getEndDate)
    .pipe(map((d) => DateUtils.fromJsDateToString(d)));
  receipts$ = this.store.select(fromReceipts.getReceipts);

  constructor(private readonly store: Store<fromReceipts.State>) {
    this.store.dispatch(ReceiptsActions.loadReceipts());
  }

  onSelectionChange(module: string) {
    this.store.dispatch(
      NavigationAction.navigateTo({
        route: `/receipts/${module.toLowerCase()}`,
      })
    );
  }

  handleRangeChange(value: any) {
    this.store.dispatch(
      ReceiptsActions.dateRangeChanged({
        startDate: value.startDate,
        endDate: value.endDate,
      })
    );
    this.store.dispatch(ReceiptsActions.loadReceipts());
  }
}
