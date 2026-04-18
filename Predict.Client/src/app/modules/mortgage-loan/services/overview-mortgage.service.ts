import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  RepaymentSchedule,
  RepaymentScheduleDto,
} from '../models/mortgage.model';
import { LocalStorageService } from 'src/app/platform/services/local-storage.service';
import { PrintoutsService } from 'src/app/platform/services/printouts.service';

@Injectable({ providedIn: 'root' })
export class MortgageLoanService {
  private readonly STORAGE_KEY = 'GraficRambursare_18-Apr-2026';

  constructor(
    private readonly _httpClient: HttpClient,
    private readonly _localStorage: LocalStorageService,
    private readonly _printouts: PrintoutsService,
  ) {}

  getRepaymentSchedules(): Observable<RepaymentSchedule[]> {
    const cachedDtos = this._localStorage.getItem<RepaymentScheduleDto[]>(
      this.STORAGE_KEY,
    );

    if (cachedDtos) return of(this.convertToModels(cachedDtos));

    return this._httpClient
      .get<
        RepaymentScheduleDto[]
      >('https://localhost:8080/api/v1/mortgage-loan/bcr')
      .pipe(
        tap((dtos) => this._localStorage.setItem(this.STORAGE_KEY, dtos)),
        map((dtos) => this.convertToModels(dtos)),
      );
  }

  private convertToModels(dtos: RepaymentScheduleDto[]): RepaymentSchedule[] {
    return dtos.map((dto) => new RepaymentSchedule(dto));
  }

  downloadRepaymentSchedulesAsJson(): void {
    const cachedDtos = this._localStorage.getItem<RepaymentScheduleDto[]>(
      this.STORAGE_KEY,
    );
    this._printouts.download(cachedDtos, `${this.STORAGE_KEY}.json`);
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

          this._localStorage.setItem(this.STORAGE_KEY, dtos);

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
