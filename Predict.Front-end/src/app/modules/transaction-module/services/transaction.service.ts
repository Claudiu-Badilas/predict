import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  TransactionDomain,
  TransactionResponse,
} from '../models/transactions.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(private httpClient: HttpClient) {}

  getTransactions(
    startDate: Date,
    endDate: Date
  ): Observable<TransactionDomain[]> {
    return this.httpClient
      .get<TransactionResponse[]>(
        `/server/api/v1/free-transactions/1?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )
      .pipe(map((res) => res.map((r) => new TransactionDomain(r))));
  }
}
