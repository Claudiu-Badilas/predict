import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { LocalStorageService } from 'src/app/platform/services/local-storage.service';
import { PrintoutsService } from 'src/app/platform/services/printouts.service';
import { RepaymentSchedule, RepaymentScheduleDto } from '../models/loan.model';

interface EncryptedRepaymentSchedules {
  iv: string;
  ciphertext: string;
}

export const LoanEncryptionKeyBase64 = 'LoanEncryptionKeyBase64';

@Injectable({ providedIn: 'root' })
export class LoanService {
  constructor(
    private readonly _httpClient: HttpClient,
    private readonly _printouts: PrintoutsService,
    private readonly localStorage: LocalStorageService,
  ) {}

  getRepaymentSchedules(): Observable<RepaymentSchedule[]> {
    return this.getRepaymentScheduleDtos().pipe(
      map((dtos) => this.convertToModels(dtos)),
      catchError((error: unknown) => {
        console.warn(
          'Could not load or convert repayment schedules from the asset; falling back to the loan API.',
          error,
        );
        return this.getRepaymentScheduleDtosFromApi().pipe(
          map((dtos) => this.convertToModels(dtos)),
        );
      }),
    );
  }

  private getRepaymentScheduleDtos(): Observable<RepaymentScheduleDto[]> {
    return this._httpClient
      .get<EncryptedRepaymentSchedules>('assets/data/grafice-rambursare.txt')
      .pipe(mergeMap((encrypted) => from(this.decode(encrypted))));
  }

  private getRepaymentScheduleDtosFromApi(): Observable<
    RepaymentScheduleDto[]
  > {
    return this._httpClient.get<RepaymentScheduleDto[]>(
      'https://localhost:8080/api/v1/loan/bcr',
    );
  }

  private convertToModels(dtos: RepaymentScheduleDto[]): RepaymentSchedule[] {
    return dtos.map((dto) => new RepaymentSchedule(dto));
  }

  private async decode(
    encrypted: EncryptedRepaymentSchedules,
  ): Promise<RepaymentScheduleDto[]> {
    // console.log('Encoded loan data:', JSON.stringify(encrypted));

    const key = await crypto.subtle.importKey(
      'raw',
      this.base64ToBytes(
        this.localStorage.getItem<string>(LoanEncryptionKeyBase64),
      ),
      'AES-GCM',
      false,
      ['encrypt', 'decrypt'],
    );
    const decodedBytes = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: this.base64ToBytes(encrypted.iv) },
      key,
      this.base64ToBytes(encrypted.ciphertext),
    );
    const decoded = JSON.parse(
      new TextDecoder().decode(decodedBytes),
    ) as RepaymentScheduleDto[];

    return decoded;
  }

  private base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }
}
