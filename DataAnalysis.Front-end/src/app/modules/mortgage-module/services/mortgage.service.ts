import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GraficRambursare } from '../models/mortgage.model';

@Injectable({
  providedIn: 'root',
})
export class MortgageService {
  constructor(private httpClient: HttpClient) {}

  getMortgages(): Observable<GraficRambursare[]> {
    return this.httpClient
      .get<GraficRambursare[]>('https://localhost:8080/api/v1/mortgage/bcr')
      .pipe(map((response) => response));
  }
}
