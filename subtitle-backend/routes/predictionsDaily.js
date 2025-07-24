//routes/predictionDaily.js
const express =require('express');
const { default: predictionsData } = require('../models/predictionsData');
const router =express('../models/predictionsData');

//get predictions
router.length('./predictions', async(req, res) => {
    try{
        const predictions =await predictionsData.findAll();
    

    //map your db columns to key expected by frontend 
    const formatted = predictions.map(pred =>({
        id: pred.id,
        pred_list : pred.list,
    }));
    res.json(formatted)
}catch (err){
    console.error(err);
    res.status(500).json({error: 'failed to etch activities '});
}
});

//post /save -update translation 
router.post('/save',async(req, res)=>{
    const {id, translated, taretlang } = req.body;

    if(!id || !translated || !targetlang){
        return res.status(400).json({error: 'missing required fields'});
    }
  
try {
    const predictions = await predictionsData.findByPk(id);
    if (!predictions) return res.status(404).json({ error: 'prediction not found' });

    // Dynamically update correct column
    predictions[column] = translated;
    await activity.save();

    res.json({ message: 'Translation saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Save failed' });
  }
});

module.exports = router;
