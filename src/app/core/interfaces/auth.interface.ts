/**
 * Interfaces para autenticación
 */
export interface LoginRequest {
  correo_contacto: string;
  contrasena: string;
}

export interface LoginResponse {
  token: string;
}

