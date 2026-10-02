import { Router } from 'express';
import * as c from '../controllers/applications.js';

const router = Router();

router.get('/', c.list);
router.post('/', c.create);
router.get('/stats', c.stats); // must be before '/:id'
router.get('/:id', c.get);
router.patch('/:id', c.update);
router.delete('/:id', c.remove);

export default router;
