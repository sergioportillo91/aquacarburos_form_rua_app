import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { Empresa, EmpresaFilter, PageResponse } from '../models/empresa.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private readonly apiUrl = `${environment.apiUrl.replace(/\/form-rua$/, '')}/empresas`;

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
   * Lista empresas con filtros y paginación
   */
  getEmpresas(filter: EmpresaFilter = {}): Observable<PageResponse<Empresa>> {
    let params = new HttpParams();
    if (filter.nit) {
      params = params.set('nit', filter.nit);
    }
    if (filter.page !== undefined) {
      params = params.set('page', filter.page.toString());
    }
    if (filter.size !== undefined) {
      params = params.set('size', filter.size.toString());
    }
    // Parámetros de ordenamiento por defecto
    params = params.set('sortBy', 'id');
    params = params.set('sortDir', 'asc');

    return this.http.get<PageResponse<Empresa>>(this.apiUrl, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Obtiene una empresa por ID
   */
  getEmpresa(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Crea una nueva empresa
   */
  createEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(this.apiUrl, empresa, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Actualiza una empresa existente
   */
  updateEmpresa(id: number, empresa: Empresa): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.apiUrl}/${id}`, empresa, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Elimina una empresa
   */
  deleteEmpresa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error al procesar la solicitud.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = 'Error de red. Verifica tu conexión.';
    } else if (error.status === 401) {
      errorMessage = 'No autorizado. Inicia sesión nuevamente.';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para esta acción.';
    } else if (error.status === 404) {
      errorMessage = 'Empresa no encontrada.';
    } else if (error.status === 409) {
      errorMessage = 'Ya existe una empresa con ese NIT o usuario.';
    } else if (error.status === 0) {
      errorMessage = 'No se pudo conectar al servidor.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
