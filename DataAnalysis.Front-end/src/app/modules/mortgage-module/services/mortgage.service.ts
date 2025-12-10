import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RepaymentSchedule } from '../models/mortgage.model';

@Injectable({
  providedIn: 'root',
})
export class MortgageService {
  constructor(private httpClient: HttpClient) {}

  getRepaymentSchedules(): Observable<RepaymentSchedule[]> {
    return this.httpClient
      .get<RepaymentSchedule[]>('https://localhost:8080/api/v1/mortgage/bcr')
      .pipe(map((response) => response));
  }
}
