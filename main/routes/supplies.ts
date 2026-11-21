import { Router, Request, Response } from 'express';
import { getDatabase, now } from '../db';
import { requirePermission } from '../services/authorization';
import {
  SupplyMovementType,
  createSupply,
  getSupply,
  listSupplies,
  listSupplyMovements,
  recordSupplyMovement,
  softDeleteSupply,
  updateSupply,
} from '../services/supplies';
import { isSupplyUnit } from '../services/units';
import { toCsvRow } from '../lib/csv';

const router = Router();
const MANUAL_MOVEMENT_TYPES: Array<'receive' | 'count' | 'adjustment' | 'waste'> = ['receive', 'count', 'adjustment', 'waste'];
const ALL_MOVEMENT_TYPES: SupplyMovementType[] = ['receive', 'count', 'adjustment', 'waste', 'recipe_depletion', 'recipe_restore'];
const MAX_SUPPLY_CSV_BYTES = 100_000;
const MAX_SUPPLY_CSV_ROWS = 10_000;

function parseSupplyCsv(text: string): Record<string, string>[] {
  if (typeof text !== 'string' || !text.trim()) throw Object.assign(new Error('No CSV data provided'), { statusCode: 400 });
  if (Buffer.byteLength(text, 'utf8') > MAX_SUPPLY_CSV_BYTES) {
    throw Object.assign(new Error(`CSV exceeds the ${MAX_SUPPLY_CSV_BYTES}-byte size limit`), { statusCode: 400 });
  }

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let closedQuote = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
        closedQuote = true;
      } else {
        field += char;
      }
      continue;
    }
    if (closedQuote) {
      if (char === ',') {
        row.push(field);
        field = '';
        closedQuote = false;
      } else if (char === '\n' || char === '\r') {
        row.push(field);
        if (row.some((value) => value.trim())) rows.push(row);
        row = [];
        field = '';
        closedQuote = false;
        if (char === '\r' && text[i + 1] === '\n') i++;
      } else {
        throw Object.assign(new Error('Malformed CSV: unexpected character after closing quote'), { statusCode: 400 });
      }
      continue;
    }
    if (char === '"' && field.length === 0) {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = '';
      if (char === '\r' && text[i + 1] === '\n') i++;
    } else {
      field += char;
    }
  }
  if (quoted) throw Object.assign(new Error('Malformed CSV: unterminated quoted field'), { statusCode: 400 });
  if (field.length > 0 || row.length > 0 || closedQuote) {
    row.push(field);
    if (row.some((value) => value.trim())) rows.push(row);
  }
  if (rows.length > MAX_SUPPLY_CSV_ROWS) {
    throw Object.assign(new Error(`CSV exceeds the ${MAX_SUPPLY_CSV_ROWS}-row limit`), { statusCode: 400 });
  }
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  if (!headers.includes('name') || !headers.includes('base_unit')) {
    throw Object.assign(new Error('CSV must include name and base_unit columns'), { statusCode: 400 });
  }
  return rows.slice(1).map((values) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => { record[header] = (values[index] ?? '').trim(); });
    return record;
  });
}

function sendError(res: Response, error: unknown): void {
  const details = error as { statusCode?: unknown; message?: unknown };
  const statusCode = Number.isInteger(details.statusCode) ? details.statusCode as number : 500;
  if (statusCode >= 500) console.error('[API] Internal error:', error);
  res.status(statusCode).json({ error: statusCode >= 500 ? 'Internal server error' : details.message });
}

function queryString(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > 128) {
    throw Object.assign(new Error(`${field} must be a non-empty string of at most 128 characters`), { statusCode: 400 });
  }
  return value.trim();
}

router.get('/', requirePermission('supplies.manage'), (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const includeInactive = req.query.include_inactive === 'true' || req.query.include_inactive === '1';
    const lowStockOnly = req.query.low_stock === 'true' || req.query.low_stock === '1';
    const search = queryString(req.query.search, 'search');
    const supplies = listSupplies(db, { includeInactive, lowStockOnly, search });
    res.json({ supplies });
  } catch (error: unknown) {
    sendError(res, error);
  }
});

router.get('/template-csv', requirePermission('supplies.manage'), (_req: Request, res: Response) => {
  const csv = [
    toCsvRow(['name', 'base_unit', 'stock_quantity', 'low_stock_threshold', 'is_active']),
    toCsvRow(['Coffee beans', 'kg', 5, 2, 'yes']),
  ].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="supplies-template.csv"');
  res.send(csv);
});

router.get('/export-csv', requirePermission('supplies.manage'), (_req: Request, res: Response) => {
  try {
    const supplies = listSupplies(getDatabase(), { includeInactive: true });
    const lines = [
      toCsvRow(['name', 'base_unit', 'stock_quantity', 'low_stock_threshold', 'is_active']),
      ...supplies.map((supply) => toCsvRow([
        supply.name,
        supply.base_unit,
        supply.stock_quantity,
        supply.low_stock_threshold,
        supply.is_active === 1 ? 'yes' : 'no',
      ])),
    ];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="supplies-export.csv"');
    res.send(lines.join('\n'));
  } catch (error: unknown) {
    sendError(res, error);
  }
});

router.post('/import-csv', requirePermission('supplies.manage'), (req: Request, res: Response) => {
  try {
    const csv = (req.body || {}).csv;
    const rows = parseSupplyCsv(csv);
    if (!rows.length) return res.status(400).json({ error: 'CSV has no data rows' });

    const db = getDatabase();
    const actorId = String((req as Request & { user?: { userId?: string } }).user?.userId || '');
    if (!actorId) return res.status(403).json({ error: 'Authentication required' });

    let created = 0;
    let updated = 0;
    let reactivated = 0;
    let failed = 0;
    const skipped = 0;
    const errors: string[] = [];

    db.transaction(() => {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const rowNumber = i + 2;
        const name = r.name?.trim();
        const baseUnit = r.base_unit?.trim().toLowerCase();
        if (!name) {
          failed++;
          errors.push(`Row ${rowNumber}: missing name`);
          continue;
        }
        if (!isSupplyUnit(baseUnit)) {
          failed++;
          errors.push(`Row ${rowNumber} (${name}): base_unit must be one of: each, g, kg, ml, l`);
          continue;
        }

        const stockRaw = r.stock_quantity?.trim();
        const stockQuantity = stockRaw === '' ? undefined : Number(stockRaw);
        if (stockQuantity !== undefined && (!Number.isFinite(stockQuantity) || stockQuantity < 0)) {
          failed++;
          errors.push(`Row ${rowNumber} (${name}): invalid stock_quantity`);
          continue;
        }

        const thresholdRaw = r.low_stock_threshold?.trim();
        const threshold = thresholdRaw === '' ? null : Number(thresholdRaw);
        if (threshold !== null && (!Number.isFinite(threshold) || threshold < 0)) {
          failed++;
          errors.push(`Row ${rowNumber} (${name}): invalid low_stock_threshold`);
          continue;
        }

        const activeRaw = r.is_active?.trim().toLowerCase();
        const isActive = activeRaw === '' || ['yes', 'true', '1', 'active'].includes(activeRaw);
        const existing = db.prepare(
          'SELECT id, base_unit FROM supplies WHERE name = ? AND deleted_at IS NULL',
        ).get(name) as { id: string; base_unit: string } | undefined;

        try {
          if (existing) {
            if (existing.base_unit !== baseUnit) {
              failed++;
              errors.push(`Row ${rowNumber} (${name}): base_unit cannot change from ${existing.base_unit} to ${baseUnit}`);
              continue;
            }
            updateSupply(db, existing.id, { lowStockThreshold: threshold, isActive });
            if (stockQuantity !== undefined) {
              recordSupplyMovement(db, {
                supplyId: existing.id,
                movementType: 'count',
                quantity: stockQuantity,
                unit: baseUnit,
                actorUserId: actorId,
                reason: 'Bulk CSV stock import',
              });
            }
            updated++;
            continue;
          }

          const deleted = db.prepare(
            'SELECT id, base_unit FROM supplies WHERE name = ? AND deleted_at IS NOT NULL',
          ).get(name) as { id: string; base_unit: string } | undefined;
          if (deleted) {
            if (deleted.base_unit !== baseUnit) {
              failed++;
              errors.push(`Row ${rowNumber} (${name}): base_unit cannot change from ${deleted.base_unit} to ${baseUnit}`);
              continue;
            }
            db.prepare('UPDATE supplies SET deleted_at = NULL, low_stock_threshold = ?, is_active = ?, updated_at = ? WHERE id = ?')
              .run(threshold, isActive ? 1 : 0, now(), deleted.id);
            if (stockQuantity !== undefined) {
              recordSupplyMovement(db, {
                supplyId: deleted.id,
                movementType: 'count',
                quantity: stockQuantity,
                unit: baseUnit,
                actorUserId: actorId,
                reason: 'Bulk CSV stock reactivation',
              });
            }
            reactivated++;
            continue;
          }

          createSupply(db, {
            name,
            baseUnit,
            stockQuantity: stockQuantity ?? 0,
            lowStockThreshold: threshold,
            isActive,
            actorUserId: actorId,
          });
          created++;
        } catch (error: unknown) {
          failed++;
          const details = error as { message?: unknown };
          errors.push(`Row ${rowNumber} (${name}): ${String(details.message || 'import failed')}`);
        }
      }
    })();

    res.json({ created, updated, reactivated, skipped, failed, errors });
  } catch (error: unknown) {
    const details = error as { statusCode?: unknown; message?: unknown };
    const statusCode = Number.isInteger(details.statusCode) ? details.statusCode as number : 500;
    res.status(statusCode).json({
      error: statusCode >= 500 ? 'Supply CSV import failed' : details.message,
      created: 0,
      updated: 0,
      reactivated: 0,
      skipped: 0,
      failed: 1,
      errors: [String(details.message || 'Supply CSV import failed')],
    });
  }
});

router.post('/', requirePermission('supplies.manage'), (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const actorId = String((req as Request & { user?: { userId?: string } }).user?.userId || '');
    if (!actorId) return res.status(403).json({ error: 'Authentication required' });
    const supply = createSupply(getDatabase(), {
      name: body.name,
      baseUnit: body.base_unit,
      stockQuantity: body.stock_quantity,
      lowStockThreshold: body.low_stock_threshold,
      isActive: body.is_active,
      actorUserId: actorId,
    });
    res.status(201).json({ supply });
  } catch (error: unknown) {
    sendError(res, error);
  }
});

router.get('/movements', requirePermission('supplies.manage'), (req: Request, res: Response) => {
  try {
    const supplyId = queryString(req.query.supply_id, 'supply_id');
    const movementType = queryString(req.query.movement_type, 'movement_type') as SupplyMovementType | undefined;
    if (movementType && !ALL_MOVEMENT_TYPES.includes(movementType)) {
      return res.status(400).json({ error: 'movement_type is invalid' });
    }
    const rawBeforeId = req.query.before_id;
    const beforeId = rawBeforeId === undefined
      ? undefined
      : typeof rawBeforeId === 'string' && /^\d+$/.test(rawBeforeId) ? Number(rawBeforeId) : NaN;
    if (beforeId !== undefined && (!Number.isSafeInteger(beforeId) || beforeId <= 0)) {
      return res.status(400).json({ error: 'before_id must be a positive integer' });
    }
    const rawPerPage = req.query.per_page;
    const requestedPerPage = rawPerPage === undefined ? NaN : Number(rawPerPage);
    const perPage = Number.isInteger(requestedPerPage) && requestedPerPage > 0
      ? Math.min(requestedPerPage, 500)
      : 50;

    const page = listSupplyMovements(getDatabase(), { supplyId, movementType, beforeId, perPage });
    res.json({
      movements: page.movements,
      ...(page.nextCursor !== null && { nextCursor: page.nextCursor }),
    });
  } catch (error: unknown) {
    sendError(res, error);
  }
});

router.get('/:id', requirePermission('supplies.manage'), (req: Request, res: Response) => {
  try {
    const supply = getSupply(getDatabase(), String(req.params.id));
    res.json({ supply });
  } catch (error: unknown) {
    sendError(res, error);
  }
});

router.put('/:id', requirePermission('supplies.manage'), (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const supply = updateSupply(getDatabase(), String(req.params.id), {
      name: body.name,
      isActive: body.is_active,
      lowStockThreshold: body.low_stock_threshold,
    });
    res.json({ supply });
  } catch (error: unknown) {
    sendError(res, error);
  }
});

router.delete('/:id', requirePermission('supplies.manage'), (req: Request, res: Response) => {
  try {
    softDeleteSupply(getDatabase(), String(req.params.id));
    res.json({ success: true });
  } catch (error: unknown) {
    sendError(res, error);
  }
});

router.post('/:id/movements', requirePermission('supplies.manage'), (req: Request, res: Response) => {
  try {
    const actorId = String((req as Request & { user?: { userId?: string } }).user?.userId || '');
    if (!actorId) return res.status(403).json({ error: 'Authentication required' });
    const body = req.body || {};
    const movementType = body.movement_type;
    if (!MANUAL_MOVEMENT_TYPES.includes(movementType)) {
      return res.status(400).json({ error: 'movement_type must be one of: receive, count, adjustment, waste' });
    }
    const movement = recordSupplyMovement(getDatabase(), {
      supplyId: String(req.params.id),
      movementType,
      quantity: body.quantity,
      unit: body.unit,
      reason: body.reason,
      actorUserId: actorId,
    });
    res.status(201).json({ movement });
  } catch (error: unknown) {
    sendError(res, error);
  }
});

export const supplyRoutes = router;
