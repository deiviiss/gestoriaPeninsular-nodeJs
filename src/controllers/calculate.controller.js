//cotización customer

//dependends
const helpers = require('../lib/handlebars')
const db = require('../database');

const controller = {};

//envía el formulario de cantidad
controller.getCalculate = async (req, res) => {
  const user = req.user
  const sqlZonas = 'SELECT zona FROM zonas'

  switch (user.permiso) {
    case 'Administrador':
      zonas = await db.query(sqlZonas)

      res.render('calculate/calcular.hbs', { user, zonas })
      break;

    case 'Regional':

      zonas = await db.query(sqlZonas + ' WHERE region = ?', user.region)

      res.render('calculate/calcular.hbs', { user, zonas })
      break;

    default:

      zonas = await db.query(sqlZonas + ' WHERE zona = ?', user.zona)

      res.render('calculate/calcular.hbs', { user })
      break;
  }
};

//recibe la cantidad a calcular
controller.postCalculate = async (req, res) => {
  const user = req.user
  const body = req.body

  helpers.calculaCosto(body, user)

  res.render('calculate/result.hbs', { retiro, user })
};

module.exports = controller;