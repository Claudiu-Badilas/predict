import { JwtHelperService } from '@auth0/angular-jwt';

export namespace AuthenticationUtils {
  export function saveToken(token: string): void {
    localStorage.setItem('jwt-token', token);
  }

  export function getToken(): string {
    return localStorage.getItem('jwt-toke');
  }

  export function logOut(): void {
    localStorage.removeItem('jwt-token');
  }

  export function isTokenValid(): boolean {
    const jwtHelper = new JwtHelperService();
    const token = getToken();
    if (
      token &&
      jwtHelper.decodeToken(token).sub &&
      !jwtHelper.isTokenExpired(token)
    ) {
      return true;
    } else {
      logOut();
      return false;
    }
  }
}
