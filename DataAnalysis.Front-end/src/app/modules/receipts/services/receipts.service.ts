import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReceiptsService {
  constructor(private httpClient: HttpClient) {}

  getReceipts(startDate: Date, endDate: Date): Observable<any[]> {
    return this.httpClient.get<any[]>(
      `/server/api/v1/receipts?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
  }
}
