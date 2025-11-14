import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../shared/services/storage.service';
import { STORAGE_KEYS } from '../constants/storage-keys.constant';
import { LoginRequest, LoginResponse } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/auth`;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credenciales)
      .pipe(
        tap(response => {
          if (response.token) {
            this.storageService.setItem(STORAGE_KEYS.TOKEN, response.token);
          }
        })
      );
  }

  getToken(): string | null {
    return this.storageService.getItem(STORAGE_KEYS.TOKEN);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && token.length > 0;
  }

  logout(): void {
    this.storageService.removeItem(STORAGE_KEYS.TOKEN);
    this.storageService.removeItem(STORAGE_KEYS.USER);
  }
}

