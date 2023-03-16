import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(private httpClient: HttpClient) {}

  getTransactions(): Observable<any[]> {
    return this.httpClient
      .get<any[]>('/server/api/v1/transactions/1')
      .pipe(map((response) => response));
  }
}
