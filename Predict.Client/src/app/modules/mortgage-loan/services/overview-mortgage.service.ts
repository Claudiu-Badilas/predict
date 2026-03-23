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

  downloadRepaymentSchedulesAsJson(): void {
    const cachedDtos = this.getDtosFromLocalStorage();

    if (!cachedDtos || cachedDtos.length === 0) {
      console.warn('No repayment schedules found in local storage');
      return;
    }

    const jsonString = JSON.stringify(cachedDtos, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.STORAGE_KEY}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  uploadRepaymentSchedulesFromJson(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (file.type !== 'application/json') {
        reject(new Error('Invalid file type. Please upload a JSON file.'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const jsonContent = event.target?.result as string;

          const dtos = JSON.parse(jsonContent) as RepaymentScheduleDto[];

          if (!Array.isArray(dtos)) {
            reject(
              new Error(
                'JSON file must contain an array of repayment schedules.',
              ),
            );
            return;
          }

          this.saveDtosToLocalStorage(dtos);

          resolve(true);
        } catch (error) {
          reject(
            new Error(`Failed to parse JSON file: ${(error as Error).message}`),
          );
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file.'));
      };

      reader.readAsText(file);
    });
  }
}
