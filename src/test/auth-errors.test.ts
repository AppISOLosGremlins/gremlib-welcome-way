import { describe, expect, it } from "vitest";
import { authErrorMessage } from "@/lib/auth-errors";

describe("Spanish authentication feedback", () => {
  it("explains invalid credentials without revealing whether an account exists", () => {
    expect(authErrorMessage({ code: "invalid_credentials", message: "Invalid login credentials" })).toBe("El correo o la contraseña no son correctos.");
  });
  it("explains rejected placeholder email addresses", () => {
    expect(authErrorMessage({ message: "This email address is not allowed." })).toContain("correo electrónico válido");
  });
  it("asks users to confirm email before sign-in", () => {
    expect(authErrorMessage({ message: "Email not confirmed" })).toContain("Confirma tu correo");
  });
  it("hides unknown internal errors", () => {
    expect(authErrorMessage({ message: "internal database failure details" })).not.toContain("database");
  });
});