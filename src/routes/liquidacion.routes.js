//liquidaciones de clientes

const express = require('express');
const router = express.Router();

const { isLoggedIn } = require('../lib/auth.js');

//controller liquidaciones
const controller = require('../controllers/liquidacion.controller.js');

//lista liquidaciones sin finalizar
router.get('/liquidaciones', isLoggedIn, controller.getLiquidaciones);

//lista resultado de busqueda de liquidaciones
router.post('/liquidaciones', isLoggedIn, controller.postLiquidaciones);

//valida si existe liquidacion render tipo liquidación
router.get('/liquidaciones/liquidar/:id', isLoggedIn, controller.getLiquidar);

//recibe liquidación a agregar
router.post('/liquidaciones/liquidar/:id', isLoggedIn, controller.postLiquidar);

//liquidación por zona
router.post('/liquidaciones/liquidar-zona', isLoggedIn, controller.postLiquidarZona);

//solicita observaciones para cerrar
router.get('/liquidaciones/close-liquidacion', isLoggedIn, controller.getClosed);

//cierra liquidación por zona con observaciones
router.post('/liquidaciones/close-liquidacion', isLoggedIn, controller.postClosed);
module.exports = router;