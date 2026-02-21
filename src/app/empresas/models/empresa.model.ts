export interface Empresa {
  id?: number;
  nit: string;
  nombre: string;
  usuario: string;
  clave?: string;
  rol: string;
  pago: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

export interface EmpresaFilter {
  nit?: string;
  nombre?: string;
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
