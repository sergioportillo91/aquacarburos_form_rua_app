import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, timeout, TimeoutError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.prod';
import { FormRuaPayload, FormRuaResponse } from '../models/form-rua.model';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class FormRuaService {
  private readonly apiUrl = environment.apiUrl;
  private readonly requestTimeoutMs = 60000;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  /**
   * Envía los datos del formulario RUA al servidor
   * @param payload Datos del formulario
   * @returns Observable con la respuesta del servidor
   */
  submit(payload: FormRuaPayload): Observable<FormRuaResponse> {
    return this.http.post<FormRuaResponse>(this.apiUrl, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      timeout(this.requestTimeoutMs),
      catchError((error: unknown) => this.handleError(error))
    );
  }

  /**
   * Maneja los errores HTTP y los transforma en mensajes legibles
   */
  private handleError(error: unknown): Observable<never> {
    let errorMessage = 'Error de conexión al guardar formulario.';

    // Timeout de RxJS
    if (error instanceof TimeoutError) {
      errorMessage = 'La solicitud tardó demasiado. Intenta nuevamente.';
      return throwError(() => new Error(errorMessage));
    }

    // Si no es HttpErrorResponse, devolver mensaje genérico
    if (!(error instanceof HttpErrorResponse)) {
      return throwError(() => new Error(errorMessage));
    }

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status === 0) {
      // Error de red
      errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else if (error.status === 400) {
      errorMessage = this.buildBackendErrorMessage(error);
    } else if (error.status === 401) {
      errorMessage = 'No autorizado. Verifica tus credenciales.';
    } else if (error.status === 403) {
      errorMessage = 'Acceso denegado.';
    } else if (error.status === 404) {
      errorMessage = 'Empresa no encontrada o servicio no disponible.';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor. Intenta más tarde.';
    } else {
      errorMessage = this.buildBackendErrorMessage(error);
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Construye un mensaje de error a partir de la respuesta del backend
   */
  private buildBackendErrorMessage(error: HttpErrorResponse): string {
    const responseError = (error.error ?? {}) as { message?: string; details?: Record<string, string> };
    let backendMessage = responseError.message || 'No se pudo guardar el formulario.';

    if (responseError.details && typeof responseError.details === 'object') {
      const detailText = Object.entries(responseError.details)
        .map(([field, message]) => `${field}: ${message}`)
        .join(' | ');
      backendMessage = `${backendMessage} ${detailText}`;
    }

    return backendMessage;
  }
}
