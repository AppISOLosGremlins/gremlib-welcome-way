import { createContext, useContext, useState, type ReactNode } from "react";
const key = (id: string) => "gremlib-workspace:" + id;
export function chooseWorkspace(id: string, admin: boolean) {
  try { sessionStorage.setItem(key(id), admin ? "admin" : "reader"); } catch { /* Session storage is optional. */ }
}
const Context = createContext({ staff: false, admin: false, toggle: () => {} });
export const useStaffMode = () => useContext(Context);
export function StaffMode({ id, staff, children }: { id: string; staff: boolean; children: ReactNode }) {
  const [active, setActive] = useState(() => { try { return sessionStorage.getItem(key(id)) !== "reader"; } catch { return true; } });
  function toggle() { chooseWorkspace(id, !active); setActive(!active); }
  return <Context.Provider value={{ staff, admin: staff && active, toggle }}>{children}</Context.Provider>;
}
