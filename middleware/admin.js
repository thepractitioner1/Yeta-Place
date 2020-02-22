

module.exports=function(req, res, next){
 if(!req.user.isadmin) return res.status(403).send("Access denied!! You don't have admin privileges");

 next();
}