import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AccessibilityProvider, useAccessibility } from "@/components/accessibility-provider";
import { accessibilityStorageKey, appearanceBootstrap, defaultAccessibilitySettings, parseAccessibilitySettings, readableTouchText } from "@/lib/accessibility";
import { playSound } from "@/lib/sounds";

const speak = vi.fn();
const cancel = vi.fn();
class Utterance { text: string; lang = ""; rate = 1; constructor(text: string) { this.text = text; } }
function Controls() {
  const {settings,update,reset}=useAccessibility();
  return <><button onClick={()=>update({darkMode:!settings.darkMode})}>Tema</button><button onClick={()=>update({readOnTouch:!settings.readOnTouch})}>Lectura</button><button onClick={reset}>Restablecer</button><p>Gestión de stock</p><button aria-label="Añadir libro">Añadir</button><input type="password" defaultValue="private-password"/><textarea defaultValue="private-review"/></>;
}
beforeEach(()=>{localStorage.clear();vi.clearAllMocks();vi.stubGlobal('speechSynthesis',{speak,cancel});vi.stubGlobal('SpeechSynthesisUtterance',Utterance);});
afterEach(()=>{cleanup();vi.unstubAllGlobals();document.documentElement.classList.remove('dark');});
describe('Appearance persistence',()=>{
 it('migrates saved preferences without losing older options',()=>{
   expect(parseAccessibilitySettings({colorMode:'tritanopia',largeText:true,highContrast:true})).toMatchObject({darkMode:false,colorMode:'tritanopia',largeText:true,highContrast:true});
 });
 it('applies the stored theme before hydration and tolerates invalid storage',()=>{
   localStorage.setItem(accessibilityStorageKey,JSON.stringify({darkMode:true}));
   new Function(appearanceBootstrap)(); expect(document.documentElement).toHaveClass('dark');
   localStorage.setItem(accessibilityStorageKey,'invalid');
   expect(()=>new Function(appearanceBootstrap)()).not.toThrow();
 });
 it('combines dark appearance with other settings, persists and resets it',async()=>{
   localStorage.setItem(accessibilityStorageKey,JSON.stringify({...defaultAccessibilitySettings,colorMode:'deuteranopia',highContrast:true,largeText:true}));
   const view=render(<AccessibilityProvider><Controls/></AccessibilityProvider>);
   fireEvent.click(screen.getByText('Tema'));
   await waitFor(()=>expect(document.documentElement).toHaveClass('dark'));
   expect(document.documentElement.dataset).toMatchObject({colorVision:'deuteranopia',highContrast:'true',largeText:'true'});
   expect(JSON.parse(localStorage.getItem(accessibilityStorageKey) ?? '{}').darkMode).toBe(true);
   view.unmount(); render(<AccessibilityProvider><Controls/></AccessibilityProvider>);
   await waitFor(()=>expect(document.documentElement).toHaveClass('dark'));
   fireEvent.click(screen.getByText('Restablecer'));
   await waitFor(()=>expect(document.documentElement).not.toHaveClass('dark'));
 });
});
describe('Existing touch speech (API mocked, not an audible device test)',()=>{
 it('speaks visible text and button accessible names in Spanish, not input values',()=>{
   localStorage.setItem(accessibilityStorageKey,JSON.stringify({...defaultAccessibilitySettings,readOnTouch:true}));
   const {container}=render(<AccessibilityProvider><Controls/></AccessibilityProvider>);
   fireEvent.click(screen.getByText('Gestión de stock'));
   expect(speak).toHaveBeenLastCalledWith(expect.objectContaining({text:'Gestión de stock',lang:'es-ES',rate:.95}));
   fireEvent.click(screen.getByText('Añadir'));
   expect(speak).toHaveBeenLastCalledWith(expect.objectContaining({text:'Añadir libro'}));
   speak.mockClear();
   fireEvent.click(container.querySelector('input') as HTMLInputElement);
   fireEvent.click(container.querySelector('textarea') as HTMLTextAreaElement);
   expect(speak).not.toHaveBeenCalled();
   fireEvent.click(screen.getByText('Lectura')); speak.mockClear();
   fireEvent.click(screen.getByText('Gestión de stock'));
   expect(speak).not.toHaveBeenCalled(); expect(cancel).toHaveBeenCalled();
 });
 it('documents the current limitation: an aria-hidden icon is ignored',()=>{
   const {container}=render(<button aria-label="Añadir libro"><svg aria-hidden="true"><path/></svg></button>);
   expect(readableTouchText(container.querySelector('path'))).toBe('');
 });
});
describe('Existing haptics (API mocked, not a physical vibration test)',()=>{
 it('vibrates independently of sound and respects the disabled setting',()=>{
   const vibrate=vi.fn(()=>true);vi.stubGlobal('navigator',{vibrate});
   localStorage.setItem(accessibilityStorageKey,JSON.stringify({...defaultAccessibilitySettings,soundEffects:false}));
   playSound('add');expect(vibrate).toHaveBeenLastCalledWith([40]);
   playSound('order');expect(vibrate).toHaveBeenLastCalledWith([60,50,80,50,120]);
   localStorage.setItem(accessibilityStorageKey,JSON.stringify({...defaultAccessibilitySettings,soundEffects:false,vibration:false}));
   vibrate.mockClear();playSound('add');expect(vibrate).not.toHaveBeenCalled();
 });
 it('does not break actions when vibration is unsupported or rejected',()=>{
   localStorage.setItem(accessibilityStorageKey,JSON.stringify({...defaultAccessibilitySettings,soundEffects:false}));
   vi.stubGlobal('navigator',{});expect(()=>playSound('add')).not.toThrow();
   vi.stubGlobal('navigator',{vibrate:()=>{throw Error('not allowed');}});expect(()=>playSound('error')).not.toThrow();
 });
});
