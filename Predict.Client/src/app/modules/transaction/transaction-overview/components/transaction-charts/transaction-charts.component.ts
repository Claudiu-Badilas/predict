import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { TransactionsStore } from 'src/app/modules/transaction/reducers/transactions.reducer';
import { HighchartWrapperComponent } from 'src/app/shared/components/highcharts-wrapper/highcharts-wrapper.component';
import { ToggleButtonComponent } from 'src/app/shared/components/toggle-button/toggle-button.component';

@Component({
  selector: 'p-transaction-charts',
  imports: [CommonModule, ToggleButtonComponent, HighchartWrapperComponent],
  templateUrl: './transaction-charts.component.html',
  styleUrls: ['./transaction-charts.component.scss'],
})
export class MostCommonTransactionComponent {
  private readonly transactionsStore = inject(TransactionsStore);

  dailyTransactionsChart = this.transactionsStore.dailyTransactionsChart;
  monthlyTransactionsChart = this.transactionsStore.monthlyTransactionsChart;

  transactionType = signal<'Daily' | 'Monthly'>('Daily');

  onTransactionTypeChange($event: string) {
    this.transactionType.set($event as 'Daily' | 'Monthly');
  }
}
