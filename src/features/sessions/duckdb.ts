import * as duckdb from "@duckdb/duckdb-wasm";
import duckdbWasmEh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import duckdbWorkerEh from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import duckdbWasmMvp from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import duckdbWorkerMvp from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import type { AnalyticsSummary, SessionRecord } from "./types";

type DuckDbSummaryRow = {
  session_count: number | bigint;
  average_coherence: number;
  average_rmssd_ms: number | null;
  best_coherence: number;
  last_seven_average: number;
};

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdbWasmMvp,
    mainWorker: duckdbWorkerMvp,
  },
  eh: {
    mainModule: duckdbWasmEh,
    mainWorker: duckdbWorkerEh,
  },
};

export async function summarizeSessionsWithDuckDb(
  sessions: SessionRecord[],
): Promise<AnalyticsSummary> {
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  const worker = new Worker(bundle.mainWorker ?? duckdbWorkerMvp);
  const db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker);

  try {
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    await db.registerFileText("sessions.json", JSON.stringify(sessions));
    const connection = await db.connect();
    try {
      await connection.insertJSONFromPath("sessions.json", {
        name: "sessions",
      });
      const result = await connection.query(`
        WITH ranked AS (
          SELECT
            coherenceScore,
            rmssdMs,
            row_number() OVER (ORDER BY startedAt DESC) AS recency
          FROM sessions
        )
        SELECT
          count(*) AS session_count,
          avg(coherenceScore) AS average_coherence,
          avg(rmssdMs) AS average_rmssd_ms,
          max(coherenceScore) AS best_coherence,
          avg(CASE WHEN recency <= 7 THEN coherenceScore ELSE NULL END) AS last_seven_average
        FROM ranked
      `);
      const row = normalizeRow(result.toArray()[0]) as DuckDbSummaryRow;
      return {
        sessionCount: Number(row.session_count),
        averageCoherence: Math.round(row.average_coherence ?? 0),
        averageRmssdMs:
          row.average_rmssd_ms === null
            ? null
            : Math.round(row.average_rmssd_ms),
        bestCoherence: Math.round(row.best_coherence ?? 0),
        lastSevenAverage: Math.round(row.last_seven_average ?? 0),
      };
    } finally {
      await connection.close();
    }
  } finally {
    await db.terminate();
  }
}

function normalizeRow(row: unknown): Record<string, unknown> {
  if (
    row &&
    typeof row === "object" &&
    "toJSON" in row &&
    typeof row.toJSON === "function"
  ) {
    return row.toJSON() as Record<string, unknown>;
  }
  return row as Record<string, unknown>;
}
