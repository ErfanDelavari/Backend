const express = require('express');
const router = express.Router();
const exercise = require('../services/exercise');

/* GET exercise. */
router.get('/', async function(req, res, next) {
  try {
    res.json(await exercise.getMultiple(req));
  } catch (err) {
    console.error(`Error while getting exercise`, err.message);
    next(err);
  }
});


router.get("/:exerciseId", async function(req, res, next){
  try {
    res.json(await exercise.getSingle(req.params.exerciseId));
  } catch (err) {
    console.error(`Error while getting exercise`, err.message);
    next(err);
  }
});
module.exports = router;