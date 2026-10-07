import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PasswordField({ id, value, onChange, newPassword = false }: { id: string; value: string; onChange: (value: string) => void; newPassword?: boolean }) {
  const [visible, setVisible] = useState(false);
  return <div className="password-field">
    <Input id={id} type={visible ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} autoComplete={newPassword ? "new-password" : "current-password"} minLength={newPassword ? 8 : undefined} maxLength={128} required />
    <Button type="button" variant="quiet" size="icon" aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} title={visible ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff /> : <Eye />}</Button>
  </div>;
}