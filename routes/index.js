import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger-output.json' with { type: "json" };

const router = express.Router();

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument), () => {
  // #swagger.ignore = true
});

export default router;
