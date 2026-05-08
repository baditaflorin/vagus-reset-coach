import{a as e,i as t,n,o as r,r as i,s as a,t as o}from"./duckdb-CXswpajd.js";var s={mvp:{mainModule:n,mainWorker:o},eh:{mainModule:t,mainWorker:i}};async function c(t){let n=await r(s),i=new Worker(n.mainWorker??`/vagus-reset-coach/assets/duckdb-browser-mvp.worker-AS4FIczp.js`),o=new a(new e,i);try{await o.instantiate(n.mainModule,n.pthreadWorker),await o.registerFileText(`sessions.json`,JSON.stringify(t));let e=await o.connect();try{await e.insertJSONFromPath(`sessions.json`,{name:`sessions`});let t=l((await e.query(`
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
      `)).toArray()[0]);return{sessionCount:Number(t.session_count),averageCoherence:Math.round(t.average_coherence??0),averageRmssdMs:t.average_rmssd_ms===null?null:Math.round(t.average_rmssd_ms),bestCoherence:Math.round(t.best_coherence??0),lastSevenAverage:Math.round(t.last_seven_average??0)}}finally{await e.close()}}finally{await o.terminate()}}function l(e){return e&&typeof e==`object`&&`toJSON`in e&&typeof e.toJSON==`function`?e.toJSON():e}export{c as summarizeSessionsWithDuckDb};