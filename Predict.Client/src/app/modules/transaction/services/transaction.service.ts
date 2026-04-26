import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  TransactionDomain,
  TransactionResponse,
} from '../models/transactions.model';
import { LocalStorageService } from 'src/app/platform/services/local-storage.service';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly STORAGE_KEY = 'Transactions_Cache';

  constructor(
    private readonly httpClient: HttpClient,
    private readonly localStorage: LocalStorageService,
  ) {}

  getTransactions(
    startDate: Date,
    endDate: Date,
  ): Observable<TransactionDomain[]> {
    // If you want date-specific caching, include them in the key:
    const cacheKey = `${this.STORAGE_KEY}_${startDate.toISOString()}_${endDate.toISOString()}`;

    const cachedDtos =
      this.localStorage.getItem<TransactionResponse[]>(cacheKey);

    if (cachedDtos) {
      return of(this.convertToModels(cachedDtos));
    }

    return this.httpClient
      .get<TransactionResponse[]>('/server/api/v1/all-transactions')
      .pipe(
        tap((dtos) => this.localStorage.setItem(cacheKey, dtos)),
        map((dtos) => this.convertToModels(dtos)),
      );
  }

  private convertToModels(dtos: TransactionResponse[]): TransactionDomain[] {
    return dtos.map((dto) => new TransactionDomain(dto));
  }
}
