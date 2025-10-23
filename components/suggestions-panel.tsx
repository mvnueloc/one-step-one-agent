"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Send,
  Calendar,
  FileText,
  PhoneIcon,
  DollarSign,
  MessageSquare,
} from "lucide-react";

const allSuggestions = [
  {
    id: 1,
    type: "tip",
    icon: Lightbulb,
    title: "Menciona la promoción activa",
    description:
      "Hay un 20% de descuento en servicios premium válido hasta fin de mes. Este cliente tiene historial de compras que califica para esta oferta especial.",
    priority: "high",
    appearAt: 5,
  },
  {
    id: 2,
    type: "upsell",
    icon: TrendingUp,
    title: "Oportunidad de upsell detectada",
    description:
      "Este cliente califica para el paquete empresarial. Su volumen de compras en los últimos 6 meses justifica la inversión y podría ahorrar hasta 30%.",
    priority: "high",
    appearAt: 15,
  },
  {
    id: 3,
    type: "reminder",
    icon: AlertCircle,
    title: "Seguimiento pendiente",
    description:
      "Cotización enviada hace 3 días sin respuesta. Preguntar si tienen dudas sobre los términos, necesitan más información técnica o ajustar el presupuesto.",
    priority: "medium",
    appearAt: 25,
  },
  {
    id: 4,
    type: "action",
    icon: DollarSign,
    title: "Momento ideal para cerrar",
    description:
      "El cliente ha mostrado interés consistente. Considera ofrecer un descuento adicional del 5% si cierra hoy. Presupuesto aprobado según última conversación.",
    priority: "high",
    appearAt: 35,
  },
  {
    id: 5,
    type: "success",
    icon: CheckCircle,
    title: "Cliente satisfecho - Solicita referidos",
    description:
      "NPS score de 9/10 en última interacción. Excelente momento para solicitar referidos o testimonial. Menciona el programa de referidos con beneficios.",
    priority: "medium",
    appearAt: 45,
  },
  {
    id: 6,
    type: "tip",
    icon: MessageSquare,
    title: "Aborda objeciones comunes",
    description:
      "Este tipo de cliente suele preguntar sobre garantías y soporte post-venta. Prepara respuestas sobre nuestro soporte 24/7 y garantía extendida de 2 años.",
    priority: "medium",
    appearAt: 55,
  },
];

const suggestedActions = [
  {
    id: 1,
    icon: Send,
    label: "Enviar Cotización",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: 2,
    icon: Calendar,
    label: "Agendar Cita",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    icon: FileText,
    label: "Enviar Propuesta",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 4,
    icon: PhoneIcon,
    label: "Programar Seguimiento",
    color: "from-orange-500 to-red-500",
  },
];

type SuggestionsPanelProps = {
  isRecording: boolean;
  recordingTime: number;
};

export function SuggestionsPanel({
  isRecording,
  recordingTime,
}: SuggestionsPanelProps) {
  const [visibleSuggestions, setVisibleSuggestions] = useState<
    typeof allSuggestions
  >([]);

  useEffect(() => {
    if (isRecording) {
      const newVisible = allSuggestions.filter(
        (s) => s.appearAt <= recordingTime
      );
      setVisibleSuggestions(newVisible);
    } else {
      // Show all suggestions when not recording
      setVisibleSuggestions(allSuggestions);
    }
  }, [isRecording, recordingTime]);

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      {/* AI Header - Responsive sizing */}
      <div className="relative shrink-0 overflow-hidden rounded-lg border border-accent/40 bg-gradient-to-br from-accent/30 via-primary/20 to-accent/30 p-3 shadow-2xl shadow-accent/30 md:rounded-xl md:p-4">
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.2),transparent)]" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/30 shadow-xl shadow-accent/40 ring-2 ring-accent/50 md:h-12 md:w-12 md:ring-4">
              <Sparkles className="h-5 w-5 animate-pulse text-accent md:h-6 md:w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground md:text-xl">
                Asistente IA
              </h2>
              <p className="text-[10px] text-muted-foreground md:text-xs">
                Sugerencias en tiempo real
              </p>
            </div>
          </div>
          {isRecording && (
            <Badge className="animate-pulse bg-accent/20 text-[10px] text-accent shadow-lg shadow-accent/30 md:text-xs">
              <span className="hidden sm:inline">
                {visibleSuggestions.length} sugerencias activas
              </span>
              <span className="sm:hidden">{visibleSuggestions.length}</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Main Suggestions Area - Responsive cards with natural scroll */}
      <div className="flex min-h-[400px] flex-col rounded-lg border border-accent/20 bg-card/80 backdrop-blur-sm md:min-h-[500px] md:rounded-xl lg:min-h-[600px] max-h-[400px]">
        <div className="shrink-0 border-b border-border/50 p-2 md:p-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground md:text-base">
            <div className="h-2 w-2 animate-pulse rounded-full bg-accent md:h-2.5 md:w-2.5" />
            Sugerencias Contextuales
            {isRecording && (
              <span className="hidden text-xs text-muted-foreground md:inline">
                (Más reciente arriba)
              </span>
            )}
          </h3>
        </div>

        <div className="flex-1 space-y-2 p-2 md:space-y-4 md:p-4">
          {visibleSuggestions.length === 0 && isRecording ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <Sparkles className="mx-auto mb-3 h-10 w-10 animate-pulse text-accent/50 md:h-12 md:w-12" />
                <p className="text-xs text-muted-foreground md:text-sm">
                  Las sugerencias aparecerán durante la llamada...
                </p>
              </div>
            </div>
          ) : (
            [...visibleSuggestions].reverse().map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <div
                  key={suggestion.id}
                  className="group relative overflow-hidden rounded-lg border-2 border-accent/40 bg-gradient-to-br from-card via-card/95 to-muted/30 p-3 shadow-2xl shadow-accent/20 transition-all hover:border-accent/60 hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] md:rounded-xl md:p-5 lg:rounded-2xl lg:p-8"
                  style={{
                    animation: isRecording
                      ? `slideIn 0.5s ease-out ${index * 0.1}s both`
                      : "none",
                  }}>
                  {/* Animated glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/15 to-accent/0 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/10 blur-3xl md:h-40 md:w-40" />

                  <div className="relative">
                    <div className="mb-2 flex items-start justify-between gap-2 md:mb-4 md:gap-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 shadow-xl ring-2 ring-accent/50 md:h-12 md:w-12 md:rounded-xl lg:h-16 lg:w-16 lg:rounded-2xl">
                          <Icon className="h-5 w-5 text-accent md:h-6 md:w-6 lg:h-8 lg:w-8" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold leading-tight text-foreground md:text-lg lg:text-2xl">
                            {suggestion.title}
                          </h4>
                          {isRecording && (
                            <p className="text-[10px] text-muted-foreground md:text-xs">
                              Apareció a los {suggestion.appearAt}s
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 px-1.5 py-0.5 text-[9px] font-bold md:px-3 md:py-1 md:text-xs ${
                          suggestion.priority === "high"
                            ? "border-accent/50 bg-accent/20 text-accent shadow-lg shadow-accent/30"
                            : "border-primary/50 bg-primary/10 text-primary"
                        }`}>
                        <span className="hidden md:inline">
                          {suggestion.priority === "high"
                            ? "PRIORIDAD ALTA"
                            : "PRIORIDAD MEDIA"}
                        </span>
                        <span className="md:hidden">
                          {suggestion.priority === "high" ? "ALTA" : "MEDIA"}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-xs leading-relaxed text-foreground/90 md:text-base lg:text-lg">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Suggested Actions - Responsive grid */}
      <Card className="shrink-0 border-accent/20 bg-card/80 p-2 backdrop-blur-sm md:p-3">
        <h3 className="mb-2 flex items-center gap-2 text-[10px] font-semibold text-foreground md:text-xs">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent md:h-2 md:w-2" />
          Accionables Sugeridos
        </h3>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {suggestedActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="group relative h-auto flex-col gap-1 overflow-hidden border-accent/20 bg-gradient-to-br from-muted/50 to-muted/30 p-2 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 md:gap-1.5">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 transition-opacity group-hover:opacity-10`}
                />
                <Icon className="h-3.5 w-3.5 text-accent transition-transform group-hover:scale-110 md:h-4 md:w-4" />
                <span className="text-[9px] font-medium leading-tight text-foreground">
                  {action.label}
                </span>
              </Button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
