const express = require('express');
const { getSetupStatus, initializeSetup } = require('../controllers/setupController');

const router = express.Router();

router.get('/status', getSetupStatus);
router.post('/initialize', initializeSetup);

module.exports = router;