import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  emoji: string;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}

export const FeatureCard = ({ emoji, title, description, onClick, className }: FeatureCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-border/50",
        "bg-card/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{emoji}</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
};
