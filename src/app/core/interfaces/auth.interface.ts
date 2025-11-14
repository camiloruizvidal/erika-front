export interface ILoginRequest {
  correo_contacto: string;
  contrasena: string;
}

export interface ILoginResponse {
  token: string;
}
