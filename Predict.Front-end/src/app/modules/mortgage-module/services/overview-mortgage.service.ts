import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RepaymentSchedule } from '../models/mortgage.model';

@Injectable({
  providedIn: 'root',
})
export class MortgageLoanService {
  constructor(private httpClient: HttpClient) {}

  getRepaymentSchedules(): Observable<RepaymentSchedule[]> {
    return this.httpClient
      .get<RepaymentSchedule[]>('/server/api/v1/mortgage-loan/bcr')
      .pipe(map((response) => response));
  }
}
