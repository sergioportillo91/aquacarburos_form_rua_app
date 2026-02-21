export interface LoginRequest {
  usuario: string;
  clave: string;
}

export interface LoginResponse {
  token: string;
  usuario: string;
  rol: string;
  empresaId: number;
  nit: string;
  nombreEmpresa: string;
}

export interface UserSession {
  token: string;
  usuario: string;
  rol: string;
  empresaId: number;
  nit: string;
  nombreEmpresa: string;
}
