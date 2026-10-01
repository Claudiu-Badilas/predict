import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { JsDateUtils } from 'src/app/shared/utils/js-date.utils';
import {
  TransactionDomain,
  TransactionResponse,
} from '../models/transactions.model';
import { TransactionService_MANUAL_STORAGE_KEY } from './transaction-settings.constants';

export const TransactionService_STORAGE_KEY = 'Transactions_Cache_Jul_2026';

interface TransactionsApiResponse {
  transactions?: TransactionResponse[];
  economii?: TransactionResponse[];
  Transactions?: TransactionResponse[];
  Economii?: TransactionResponse[];
}

export interface TransactionData {
  transactions: TransactionDomain[];
  economii: TransactionDomain[];
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly localStorage: LocalStorageService,
  ) {}

  getTransactions(startDate: Date, endDate: Date): Observable<TransactionData> {
    const rangeStart = new Date(startDate);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(endDate);
    rangeEnd.setHours(23, 59, 59, 999);
    const manuallyUploadedDtos = this.localStorage.getItem<
      TransactionResponse[]
    >(TransactionService_MANUAL_STORAGE_KEY);
    const cachedData = this.localStorage.getItem<
      TransactionResponse[] | TransactionsApiResponse
    >(TransactionService_STORAGE_KEY);

    const source$: Observable<TransactionsApiResponse | TransactionResponse[]> =
      manuallyUploadedDtos
        ? of<TransactionsApiResponse>({
            transactions: manuallyUploadedDtos,
            economii: [],
          })
        : cachedData && !Array.isArray(cachedData)
          ? of(cachedData)
          : this.httpClient
              .get<TransactionsApiResponse>(
                'https://localhost:8080/api/v1/transactions',
              )
              .pipe(
                tap((data) =>
                  this.localStorage.setItem(
                    TransactionService_STORAGE_KEY,
                    data,
                  ),
                ),
              );

    return source$.pipe(
      map((data) => {
        const response = Array.isArray(data)
          ? { transactions: data, economii: [] }
          : data;
        const transactions =
          response.transactions ?? response.Transactions ?? [];
        const economii = response.economii ?? response.Economii ?? [];
        return {
          transactions: this.filterByDate(transactions, rangeStart, rangeEnd),
          economii: this.filterByDate(economii, rangeStart, rangeEnd),
        };
      }),
    );
  }

  private filterByDate(
    dtos: TransactionResponse[],
    rangeStart: Date,
    rangeEnd: Date,
  ): TransactionDomain[] {
    return this.convertToModels(dtos).filter(
      ({ completionDate }) =>
        JsDateUtils.isValidDate(completionDate) &&
        completionDate >= rangeStart &&
        completionDate <= rangeEnd,
    );
  }

  private convertToModels(dtos: TransactionResponse[]): TransactionDomain[] {
    return dtos.map((dto) => new TransactionDomain(dto));
  }
}
