import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  RepaymentSchedule,
  RepaymentScheduleDto,
} from '../models/mortgage.model';

@Injectable({
  providedIn: 'root',
})
export class MortgageLoanService {
  private readonly STORAGE_KEY = 'GraficRambursare_18-Mar-2026';

  constructor(private httpClient: HttpClient) {}

  getRepaymentSchedules(): Observable<RepaymentSchedule[]> {
    const cachedDtos = this.getDtosFromLocalStorage();

    if (cachedDtos) return of(this.convertToModels(cachedDtos));

    return this.httpClient
      .get<
        RepaymentScheduleDto[]
      >('https://localhost:8080/api/v1/mortgage-loan/bcr')
      .pipe(
        tap((dtos) => this.saveDtosToLocalStorage(dtos)),
        map((dtos) => this.convertToModels(dtos)),
      );
  }

  private saveDtosToLocalStorage(dtos: RepaymentScheduleDto[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dtos));
  }

  private getDtosFromLocalStorage(): RepaymentScheduleDto[] | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as RepaymentScheduleDto[];
  }

  private convertToModels(dtos: RepaymentScheduleDto[]): RepaymentSchedule[] {
    return dtos.map((dto) => new RepaymentSchedule(dto));
  }
}
