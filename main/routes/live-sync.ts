import { Router, Request, Response } from 'express';
import { requireAnyPermission } from '../services/authorization';
import { asyncHandler } from '../middleware/async-handler';
import {
  getLiveSyncConfig,
  updateLiveSyncConfig,
  pushLiveSync,
  testLiveSyncConnection,
} from '../services/live-sync';

const router = Router();

const canManage = requireAnyPermission('settings.manage', 'mobile-access.manage');
const canView = requireAnyPermission('settings.view', 'settings.manage', 'mobile-access.manage');

// 1. Get Live Sync Config
router.get('/config', canView, (_req: Request, res: Response) => {
  const config = getLiveSyncConfig();
  res.json({ config });
});

// 2. Update Live Sync Config
router.post('/config', canManage, (req: Request, res: Response) => {
  const patch = req.body ?? {};
  const updated = updateLiveSyncConfig(patch);
  res.json({ ok: true, config: updated });
});

// 3. Test Connection with endpoint
router.post('/test', canManage, asyncHandler(async (req: Request, res: Response) => {
  const { syncUrl, apiKey } = req.body ?? {};
  const config = getLiveSyncConfig();
  const testUrl = (syncUrl || config.syncUrl || '').trim();
  const testKey = (apiKey || config.apiKey || '').trim();

  const result = await testLiveSyncConnection(testUrl, testKey);
  res.json(result);
}));

// 4. Force Sync Now
router.post('/sync-now', canManage, asyncHandler(async (_req: Request, res: Response) => {
  const result = await pushLiveSync({ force: true });
  const config = getLiveSyncConfig();
  res.json({ ...result, config });
}));

export const liveSyncRoutes = router;
