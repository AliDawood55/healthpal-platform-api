import dotenv from 'dotenv';
import pool from '../Config/DBconnection.js';

dotenv.config();

const BASE = process.env.OPENFDA_BASE_URL || 'https://api.fda.gov';
const CACHE_TTL_MS = parseInt(process.env.OPENFDA_CACHE_TTL_MS || String(1000 * 60 * 60), 10); 

const cache = new Map();

function getCache(key) {
  const it = cache.get(key);
  if (!it) return null;
  if (Date.now() > it.expiresAt) {
    cache.delete(key);
    return null;
  }
  return it.data;
}

function setCache(key, data) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function fetchOpenFda(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const txt = await res.text();
    const err = new Error(`OpenFDA fetch failed: ${res.status} ${txt}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}


function extractText(v, maxLen = 500) {
  if (!v && v !== 0) return '';
  let str = '';
  if (Array.isArray(v) && v.length) str = v[0];
  else if (typeof v === 'string') str = v;
  else str = String(v);

  str = str.replace(/\s+/g, ' ').trim();
  if (str.length > maxLen) return str.slice(0, maxLen).trim() + '...';
  return str;
}

function normalizeLabel(result) {
  const of = result.openfda || {};

  const brand = extractText(of.brand_name);
  const generic = extractText(of.generic_name);
  const manufacturer = extractText(of.manufacturer_name);
  const dosage = extractText(result.dosage_and_administration);
  const indications = extractText(result.indications_and_usage);
  const warnings = extractText(result.warnings);

  return {
    
    id: result.id || (of.product_ndc && of.product_ndc[0]) || null,
    openfda: of,
    
    brand_name: brand,
    generic_name: generic,
    manufacturer_name: manufacturer,
    dosage_and_administration: dosage,
    indications_and_usage: indications,
    warnings: warnings,
    source: 'openfda',
  };
}


function toPublicShape(item) {
  return {
    brand_name: item.brand_name || '',
    generic_name: item.generic_name || '',
    manufacturer_name: item.manufacturer_name || '',
    indications: item.indications_and_usage || '',
    dosage: item.dosage_and_administration || '',
    warnings: item.warnings || '',
    source: item.source || '',
  };
}

export async function searchDrugByName(name, limit = 5, options = { forceFetch: false }) {
  const key = `openfda:search:${name.toLowerCase()}:${limit}`;
  const cached = getCache(key);
  if (cached) return cached;
  
  if (!options.forceFetch) {
    try {
      const q = `%${name}%`;
      const [rows] = await pool.query(
        `SELECT id, openfda_id, brand_name, generic_name, manufacturer_name, dosage_and_administration, indications_and_usage, warnings, adverse_reactions, openfda_raw, source, retrieved_at FROM medication_catalog WHERE brand_name LIKE ? OR generic_name LIKE ? LIMIT ?`,
        [q, q, limit]
      );
      if (rows && rows.length) {
        
        const publicMapped = rows.map(r => ({
          brand_name: r.brand_name || '',
          generic_name: r.generic_name || '',
          manufacturer_name: r.manufacturer_name || '',
          indications: r.indications_and_usage || '',
          dosage: r.dosage_and_administration || '',
          warnings: r.warnings || '',
          source: r.source || 'catalog',
        }));
        setCache(key, publicMapped);
        return publicMapped;
      }
    } catch (dbErr) {
      console.error('OpenFDA service - DB fallback error:', dbErr && dbErr.message ? dbErr.message : dbErr);
      
    }
  }

  const queries = [
    `openfda.generic_name:\"${name}\"`,
    `openfda.brand_name:\"${name}\"`,
    `openfda.substance_name:\"${name}\"`,
  ];

  const found = new Map();

  for (const q of queries) {
    const path = `/drug/label.json?search=${encodeURIComponent(q)}&limit=${limit}`;
    try {
      const json = await fetchOpenFda(path);
      const results = Array.isArray(json.results) ? json.results : [];
      for (const r of results) {
        const norm = normalizeLabel(r);
        const uid = `${norm.brand_name || ''}||${norm.generic_name || ''}`;
        if (!found.has(uid)) found.set(uid, norm);
      }
    } catch (err) {
      if (err && err.status === 404) continue;
    }
  }

  
  if (!found.size) {
    const broadQueries = [
      `${name}`,
      `openfda.brand_name:${name}`,
      `openfda.generic_name:${name}`,
      `openfda.substance_name:${name}`,
    ];

    for (const bq of broadQueries) {
      const path = `/drug/label.json?search=${encodeURIComponent(bq)}&limit=${limit}`;
      try {
        const json = await fetchOpenFda(path);
        const results = Array.isArray(json.results) ? json.results : [];
        for (const r of results) {
          const norm = normalizeLabel(r);
          const uid = `${norm.brand_name || ''}||${norm.generic_name || ''}`;
          if (!found.has(uid)) found.set(uid, norm);
        }
        if (found.size) break; 
      } catch (err) {
        
      }
    }
  }

  const internalResults = Array.from(found.values()).slice(0, limit);
 
  if (internalResults && internalResults.length) {
    try {
      const p = pool.promise ? pool.promise() : pool;
      for (const item of internalResults) {
        try {
          const openfda_raw = item.openfda ? JSON.stringify(item.openfda) : null;
          const now = new Date();
          
          let exists = null;
          if (item.id) {
            const [rows] = await p.query(`SELECT id FROM medication_catalog WHERE openfda_id = ? LIMIT 1`, [item.id]);
            if (rows && rows.length) exists = rows[0];
          }
          if (!exists) {
            const [rows2] = await p.query(`SELECT id FROM medication_catalog WHERE brand_name = ? AND generic_name = ? LIMIT 1`, [item.brand_name || null, item.generic_name || null]);
            if (rows2 && rows2.length) exists = rows2[0];
          }

          if (exists) {
            
            await p.query(
              `UPDATE medication_catalog SET brand_name = ?, generic_name = ?, manufacturer_name = ?, dosage_and_administration = ?, indications_and_usage = ?, warnings = ?, adverse_reactions = ?, openfda_raw = ?, source = ?, retrieved_at = ? WHERE id = ?`,
              [item.brand_name, item.generic_name, item.manufacturer_name, item.dosage_and_administration, item.indications_and_usage, item.warnings, null, openfda_raw, 'openfda', now, exists.id]
            );
          } else {
            await p.query(
              `INSERT INTO medication_catalog (openfda_id, brand_name, generic_name, manufacturer_name, dosage_and_administration, indications_and_usage, warnings, adverse_reactions, openfda_raw, source, retrieved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [item.id, item.brand_name, item.generic_name, item.manufacturer_name, item.dosage_and_administration, item.indications_and_usage, item.warnings, null, openfda_raw, 'openfda', now]
            );
          }
        } catch (iErr) {
          
          console.error('OpenFDA service - error saving to DB for item', item.brand_name || item.generic_name, iErr && iErr.message ? iErr.message : iErr);
        }
      }
    } catch (saveErr) {
      console.error('OpenFDA service - error persisting results:', saveErr && saveErr.message ? saveErr.message : saveErr);
    }
  }

  
  const publicResults = internalResults.map(toPublicShape);
  setCache(key, publicResults);
  return publicResults;
}

export default { searchDrugByName };
