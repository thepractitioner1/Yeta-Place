const express = require('express');
const users = require('../model/user');


module.exports = function(app){
    app.use(express.json());
    app.use('/api/users', users);
}