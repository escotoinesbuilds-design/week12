import type { Provider } from "@/lib/comparison";

export const demoProviders: Provider[] = [
  {
    id: "perfil-ficticio-01",
    name: "Dra. Lucía Ejemplo",
    consultationPriceMxn: 950,
    distanceKm: 4,
    schedules: ["tarde"],
    gender: "mujer",
    dataStatus: "simulated",
  },
  {
    id: "perfil-ficticio-02",
    name: "Dr. Mateo Demo",
    consultationPriceMxn: 1450,
    distanceKm: 3.2,
    schedules: null,
    gender: "hombre",
    dataStatus: "simulated",
  },
  {
    id: "perfil-ficticio-03",
    name: "Dra. Elena Muestra",
    consultationPriceMxn: 800,
    distanceKm: null,
    schedules: ["manana"],
    gender: "mujer",
    dataStatus: "simulated",
  },
  {
    id: "perfil-ficticio-04",
    name: "Profesional Ficticio 04",
    consultationPriceMxn: null,
    distanceKm: 7,
    schedules: ["noche"],
    gender: null,
    dataStatus: "simulated",
  },
];
