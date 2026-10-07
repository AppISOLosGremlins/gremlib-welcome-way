export function authErrorMessage(error: { message: string; code?: string }) {
  if (error.code === "invalid_credentials" || /invalid login credentials/i.test(error.message)) return "El correo o la contraseña no son correctos.";
  if (/email not confirmed/i.test(error.message)) return "Confirma tu correo antes de iniciar sesión. Revisa también la carpeta de spam.";
  if (/already registered|already been registered/i.test(error.message)) return "Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña.";
  if (/rate limit|too many requests/i.test(error.message)) return "Se han realizado demasiados intentos. Espera unos minutos y vuelve a probar.";
  if (/password/i.test(error.message)) return "La contraseña no cumple los requisitos de seguridad. Usa al menos 8 caracteres y evita contraseñas comunes.";
  if (/fetch|network/i.test(error.message)) return "No se ha podido conectar. Comprueba tu conexión e inténtalo de nuevo.";
  return "No hemos podido completar la solicitud. Inténtalo de nuevo en unos momentos.";
}