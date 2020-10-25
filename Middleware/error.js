
module.exports = function(err, req, res, next){
    console.log("UncaughtErr", err);

    res.status(500).send('Something failed.');
}
