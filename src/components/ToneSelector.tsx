import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tones = [
  { id: "casual", label: "Casual", emoji: "😎" },
  { id: "confiante", label: "Confiante", emoji: "💪" },
  { id: "brincalhao", label: "Brincalhão", emoji: "😄" },
  { id: "provocante", label: "Provocante", emoji: "😏" },
];

interface ToneSelectorProps {
  selectedTone: string | null;
  onSelectTone: (tone: string) => void;
}

export const ToneSelector = ({ selectedTone, onSelectTone }: ToneSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {tones.map((tone) => (
        <Button
          key={tone.id}
          variant={selectedTone === tone.id ? "default" : "outline"}
          size="lg"
          onClick={() => onSelectTone(tone.id)}
          className={cn(
            "h-auto py-4 flex flex-col gap-2 text-base font-medium",
            selectedTone === tone.id && "bg-primary text-primary-foreground"
          )}
        >
          <span className="text-2xl">{tone.emoji}</span>
          <span>{tone.label}</span>
        </Button>
      ))}
    </div>
  );
};
