import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MortgageService {
  constructor(private httpClient: HttpClient) {}

  getMortgages(): Observable<any[]> {
    return this.httpClient
      .get<any[]>('https://localhost:8080/api/v1/mortgage/bcr')
      .pipe(map((response) => response));
  }
}
