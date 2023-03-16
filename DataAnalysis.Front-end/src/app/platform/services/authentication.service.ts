import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  constructor(private http: HttpClient) {}

  public login(user: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(`server/api/user/login`, user, {
      observe: 'response',
    });
  }

  public register(user: any): Observable<any> {
    return this.http.post<any>(`server/api/user/register`, user);
  }
}
