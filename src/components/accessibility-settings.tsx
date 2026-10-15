import { useId } from "react";
import { Accessibility, Contrast, Palette, RotateCcw, Type, Volume2, VolumeX } from "lucide-react";
import { useAccessibility } from "@/components/accessibility-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { colorModes } from "@/lib/accessibility";

export function AccessibilitySettingsButton() {
  const { settings, update, reset, speechSupported, speechError, stopReading } = useAccessibility();
  const id = useId();
  return <Dialog>
    <DialogTrigger asChild><Button variant="outline" className="accessibility-trigger"><Accessibility aria-hidden="true" /> Accesibilidad</Button></DialogTrigger>
    <DialogContent className="accessibility-panel" data-accessibility-settings>
      <DialogHeader><DialogTitle><Accessibility aria-hidden="true" /> Accesibilidad</DialogTitle><DialogDescription>Tu lectura, a tu medida.</DialogDescription></DialogHeader>
      <div className="accessibility-options">
        <div className="accessibility-color-setting">
          <label htmlFor={`${id}-colors`}><Palette aria-hidden="true" /> Adaptación para daltonismo</label>
          <Select value={settings.colorMode} onValueChange={value => { const mode = colorModes.find(mode => mode.value === value); if (mode) update({ colorMode: mode.value }); }}>
            <SelectTrigger id={`${id}-colors`}><SelectValue /></SelectTrigger>
            <SelectContent data-accessibility-settings>{colorModes.map(mode => <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="accessibility-setting"><label htmlFor={`${id}-contrast`}><Contrast aria-hidden="true" /> Alto contraste</label><Switch id={`${id}-contrast`} checked={settings.highContrast} onCheckedChange={highContrast => update({ highContrast })} /></div>
        <div className="accessibility-setting"><label htmlFor={`${id}-read`}><Volume2 aria-hidden="true" /> Leer al tocar</label><Switch id={`${id}-read`} checked={settings.readOnTouch} disabled={!speechSupported} onCheckedChange={readOnTouch => update({ readOnTouch })} /></div>
        {!speechSupported && <p className="accessibility-note" role="status">La lectura en voz alta no está disponible en este navegador.</p>}
        {speechError && <p className="accessibility-note" role="alert">{speechError}</p>}
        {settings.readOnTouch && <Button variant="quiet" onClick={stopReading}><VolumeX aria-hidden="true" /> Detener lectura</Button>}
        <div className="accessibility-text-setting"><span id={`${id}-text`}><Type aria-hidden="true" /> Tamaño del texto</span>
          <ToggleGroup type="single" value={settings.largeText ? "large" : "normal"} onValueChange={value => { if (value) update({ largeText: value === "large" }); }} aria-labelledby={`${id}-text`}>
            <ToggleGroupItem value="normal">Normal</ToggleGroupItem><ToggleGroupItem value="large">Ampliado</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      <Button variant="quiet" className="accessibility-reset" onClick={reset}><RotateCcw aria-hidden="true" /> Restablecer ajustes</Button>
    </DialogContent>
  </Dialog>;
}