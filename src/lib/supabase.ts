import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Provider, Schedule } from "@/lib/comparison";
import { demoProviders } from "@/lib/demo-providers";

type ProviderRow = {
  id: string;
  name: string;
  consultation_price_mxn: number | null;
  distance_km: number | null;
  schedules: string[] | null;
  gender: string | null;
  data_status: "simulated" | "unverified";
};

export type ProviderSource = "local" | "supabase";

export type ProviderResult =
  | { providers: Provider[]; source: ProviderSource }
  | { error: string; status: number };

function isSchedule(value: string): value is Schedule {
  return value === "manana" || value === "tarde" || value === "noche";
}

function mapProvider(row: ProviderRow): Provider {
  const providerSchedules =
    row.schedules === null || row.schedules.every(isSchedule)
      ? row.schedules
      : null;

  return {
    id: row.id,
    name: row.name,
    consultationPriceMxn: row.consultation_price_mxn,
    distanceKm: row.distance_km,
    schedules: providerSchedules,
    gender:
      row.gender === "mujer" || row.gender === "hombre" ? row.gender : null,
    dataStatus: row.data_status,
  };
}

export async function loadProviders(): Promise<ProviderResult> {
  const url = process.env.SUPABASE_URL?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();

  if (!url && !anonKey) {
    return { providers: demoProviders, source: "local" };
  }
  if (!url || !anonKey) {
    return {
      error: "Configura SUPABASE_URL y SUPABASE_ANON_KEY juntos, o elimina ambos para usar la demostración local.",
      status: 503,
    };
  }

  try {
    new URL(url);
  } catch {
    return {
      error: "SUPABASE_URL no es una URL válida. Corrige la configuración para cargar los perfiles.",
      status: 503,
    };
  }

  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await supabase
    .from("providers")
    .select(
      "id, name, consultation_price_mxn, distance_km, schedules, gender, data_status",
    )
    .order("id");

  if (error) {
    console.error("Could not load Supabase provider records:", error.message);
    return {
      error: "No se pudieron cargar los perfiles de Supabase. Revisa la conexión y las políticas de lectura.",
      status: 502,
    };
  }

  return { providers: data.map(mapProvider), source: "supabase" };
}
