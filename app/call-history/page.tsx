import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { CallDurationChart } from "@/components/call-duration-chart";

type FeedbackItem = {
  _id: string;
  name: string;
  age: number;
  budget: number;
  capacity: number;
  carType: string;
  feedback: string;
  durationSeconds?: number | null;
  createdAt?: string;
};

// MOCK: datos de historial (usar mientras la API no funcione)
const MOCK_ITEMS: FeedbackItem[] = [
  {
    _id: "m1",
    name: "María López",
    age: 34,
    budget: 320000,
    capacity: 5,
    carType: "economical",
    feedback: "Me gustó la recomendación, cumple con mi presupuesto y espacio.",
    durationSeconds: 287,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "m2",
    name: "Juan Pérez",
    age: 28,
    budget: 450000,
    capacity: 2,
    carType: "sport",
    feedback: "Preferiría un modelo con mejor rendimiento en carretera.",
    durationSeconds: 412,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    _id: "m3",
    name: "Ana Torres",
    age: 41,
    budget: 600000,
    capacity: 7,
    carType: "premium",
    feedback: "Excelente opción para mi familia, ¿podemos agendar prueba?",
    durationSeconds: 198,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export default async function CallHistoryPage() {
  const items = MOCK_ITEMS;

  // Construir serie temporal (minutos) desde los mocks
  const series = items
    .slice()
    .sort(
      (a, b) =>
        (a.createdAt ? +new Date(a.createdAt) : 0) -
        (b.createdAt ? +new Date(b.createdAt) : 0)
    )
    .map((it) => ({
      label: it.createdAt
        ? new Date(it.createdAt).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—",
      minutes:
        typeof it.durationSeconds === "number"
          ? Math.max(0, Math.round(it.durationSeconds / 60))
          : 0,
    }));

  return (
    <>
      <div className="modern-background" />
      <div className="min-h-screen p-3">
        <div className="mx-auto max-w-5xl space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                Historial de Llamadas
              </h1>
              <p className="text-sm text-muted-foreground">
                Feedback recopilado por el agente durante las llamadas
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-primary/20 hover:bg-primary/10 text-white">
              <Link
                href="/"
                className="text-white">
                Volver
              </Link>
            </Button>
          </header>

          <Card className="border-border/50 bg-card/80 p-4 md:p-6 backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="mb-2 text-base font-semibold text-foreground">
                Duración de llamadas (últimas)
              </h2>
              <CallDurationChart data={series} />
            </div>
            {items.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                No hay registros todavía.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Presupuesto</TableHead>
                    <TableHead>Capacidad</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((it) => {
                    const created = it.createdAt
                      ? new Date(it.createdAt)
                      : null;
                    const duration =
                      typeof it.durationSeconds === "number"
                        ? `${Math.floor(it.durationSeconds / 60)}m ${Math.floor(
                            it.durationSeconds % 60
                          )}s`
                        : "—";
                    return (
                      <TableRow key={it._id}>
                        <TableCell>
                          {created ? created.toLocaleString("es-ES") : "—"}
                        </TableCell>
                        <TableCell className="font-medium">{it.name}</TableCell>
                        <TableCell>{it.age}</TableCell>
                        <TableCell>
                          {it.budget.toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })}
                        </TableCell>
                        <TableCell>{it.capacity}</TableCell>
                        <TableCell className="capitalize">
                          {it.carType}
                        </TableCell>
                        <TableCell>{duration}</TableCell>
                        <TableCell className="max-w-[420px] whitespace-normal wrap-break-word">
                          {it.feedback}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableCaption>Mostrando {items.length} registros</TableCaption>
              </Table>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
