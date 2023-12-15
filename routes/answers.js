const router = require('express').Router();

router.get('/', async (req, res) => {
    res.json({
        status: 'success',
        data: 'You are authorized',
    });
});

module.exports = router;