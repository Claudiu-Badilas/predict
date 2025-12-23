import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ReceiptDomain } from '../models/receipts-domain.model';
import { ReceiptDto } from '../models/receipts-dto.model';

@Injectable({
  providedIn: 'root',
})
export class ReceiptsService {
  constructor(private httpClient: HttpClient) {}

  getReceipts(startDate: Date, endDate: Date): Observable<ReceiptDomain[]> {
    return this.httpClient
      .get<ReceiptDto[]>(
        `/server/api/v1/receipts?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )
      .pipe(map((res) => res.map((r) => new ReceiptDomain(r))));
  }
}
