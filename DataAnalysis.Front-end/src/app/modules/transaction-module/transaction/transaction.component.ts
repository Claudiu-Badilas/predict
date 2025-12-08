import { TransactionService } from 'src/app/modules/transaction-module/services/transaction.service';
import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs';

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styles: [],
    standalone: false
})
export class TransactionComponent implements OnInit {
  transactions: any[] = [];
  ngOnInit(): void {}

  constructor(private _transactionService: TransactionService) {
    this._transactionService
      .getTransactions()
      .pipe(first())
      .subscribe((res) => {
        this.transactions = res;
      });
  }
}
