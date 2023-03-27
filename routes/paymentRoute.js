const express = require ('express');
const Router = express.Router();
const {Add,Verify}=require ("../routes/payment");
Router.post('payment' ,Add);
Router.post('payment/:id' ,Verify);
module.exports = Router;