import { useGeneratePassword } from "@/hooks/useGeneratePassword";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { RefreshCcw, Wand2 } from "lucide-react";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";

interface PasswordGeneratorPopoverProps {
  onGenerate: (password: string) => void;
}

export function PasswordGeneratorPopover({
  onGenerate,
}: PasswordGeneratorPopoverProps) {
  const { isSubmitting, generate } = useGeneratePassword();

  const [length, setLength] = useState(18);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(true);
  const [preview, setPreview] = useState("");

  async function refresh(
    overrides?: Partial<{
      length: number;
      uppercase: boolean;
      lowercase: boolean;
      numbers: boolean;
      symbols: boolean;
      excludeSimilar: boolean;
    }>,
  ) {
    const options = {
      length,
      uppercase,
      lowercase,
      numbers,
      symbols,
      excludeSimilar,
      ...overrides,
    };

    try {
      const password = await generate(options);
      setPreview(password);
    } catch {}
  }

  return (
    <Popover onOpenChange={(open) => open && refresh()}>
      <PopoverTrigger asChild>
        <Button>
          <Wand2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-4">
        <div className="flex items-center gap-2 rounded-md border p-2 font-momo text-sm">
          <span className="flex-1 break-all">
            {isSubmitting ? "Generando..." : preview}
          </span>
          <button
            type="button"
            onClick={() => refresh()}
            aria-label="Regenerar"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Longitud</Label>
            <span>{length}</span>
          </div>
          <Slider
            min={8}
            max={64}
            value={[length]}
            onValueChange={([v]) => setLength(v)}
            onValueCommit={([v]) => refresh({ length: v })}
          />
        </div>

        {[
          {
            key: "uppercase",
            label: "Mayúsculas",
            value: uppercase,
            set: setUppercase,
          },
          {
            key: "lowercase",
            label: "Minúsculas",
            value: lowercase,
            set: setLowercase,
          },
          { key: "numbers", label: "Números", value: numbers, set: setNumbers },
          {
            key: "symbols",
            label: "Símbolos",
            value: symbols,
            set: setSymbols,
          },
          {
            key: "excludeSimilar",
            label: "Evitar caracteres similares (O, 0, l, I)",
            value: excludeSimilar,
            set: setExcludeSimilar,
          },
        ].map(({ key, label, value, set }) => (
          <div key={key} className="flex items-center justify-between">
            <Label className="text-sm font-normal">{label}</Label>
            <Switch
              checked={value}
              onCheckedChange={(v) => {
                set(v);
                refresh({ [key]: v } as any);
              }}
            />
          </div>
        ))}

        <Button
          type="button"
          className="w-full"
          disabled={isSubmitting || !preview}
          onClick={() => onGenerate(preview)}
        >
          Usar esta contraseña
        </Button>
      </PopoverContent>
    </Popover>
  );
}
