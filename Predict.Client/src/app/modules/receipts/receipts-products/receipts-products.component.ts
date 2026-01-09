import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import * as ReceiptsActions from 'src/app/modules/receipts/actions/receipts.actions';
import * as fromReceipts from 'src/app/modules/receipts/reducers/receipts.reducer';
import { RangeSelectorComponent } from 'src/app/shared/components/date-range-picker/date-range-picker.component';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { SearchInputComponent } from 'src/app/shared/components/search-input/search-input.component';
import { SideBarComponent } from 'src/app/shared/components/side-bar/side-bar.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';
import { DateUtils } from 'src/app/shared/utils/date.utils';
import * as NavigationAction from 'src/app/store/actions/navigation.actions';

@Component({
  selector: 'app-receipts-products',
  imports: [
    CommonModule,
    SideBarComponent,
    RangeSelectorComponent,
    ToggleButtonComponent,
    SearchInputComponent,
    HighchartWrapperComponent,
  ],
  templateUrl: './receipts-products.component.html',
  styleUrl: './receipts-products.component.scss',
})
export class ReceiptsProductsComponent {
  startDate$ = this.store.select(fromReceipts.getStartDate);
  endDate$ = this.store.select(fromReceipts.getEndDate);
  dailyPurchasedProductChart$ = this.store.select(
    fromReceipts.getDailyPurchasedProductChart
  );
  productPriceTrendChartUtils$ = this.store.select(
    fromReceipts.getProductPriceTrendChartUtils
  );

  minDate = new Date('2021-01-01');
  now = new Date();

  constructor(private readonly store: Store<fromReceipts.State>) {}

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

  onSearch(value: string) {
    this.store.dispatch(
      ReceiptsActions.searchTermChanged({ searchTerm: value })
    );
  }
}
