import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.prod';
import { LoginRequest, LoginResponse, UserSession } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.authUrl;
  private readonly SESSION_KEY = 'user_session';
  
  private currentUserSubject = new BehaviorSubject<UserSession | null>(this.getStoredSession());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  /**
   * Realiza el login del usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.storeSession(response)),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const session = this.getStoredSession();
    return session !== null && session.token !== '';
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    const session = this.getStoredSession();
    return session?.token || null;
  }

  /**
   * Obtiene la sesión actual del usuario
   */
  getCurrentUser(): UserSession | null {
    return this.currentUserSubject.value;
  }

  /**
   * Almacena la sesión en sessionStorage
   */
  private storeSession(response: LoginResponse): void {
    const session: UserSession = {
      token: response.token,
      usuario: response.usuario,
      rol: response.rol,
      empresaId: response.empresaId,
      nit: response.nit,
      nombreEmpresa: response.nombreEmpresa
    };
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    this.currentUserSubject.next(session);
  }

  /**
   * Recupera la sesión almacenada
   */
  private getStoredSession(): UserSession | null {
    const sessionStr = sessionStorage.getItem(this.SESSION_KEY);
    if (!sessionStr) {
      return null;
    }
    try {
      return JSON.parse(sessionStr) as UserSession;
    } catch {
      return null;
    }
  }

  /**
   * Maneja errores de autenticación
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error de conexión. Intenta nuevamente.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = 'Error de red. Verifica tu conexión.';
    } else if (error.status === 401) {
      errorMessage = 'Usuario o contraseña incorrectos.';
    } else if (error.status === 403) {
      errorMessage = 'Acceso denegado.';
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar al servidor.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
