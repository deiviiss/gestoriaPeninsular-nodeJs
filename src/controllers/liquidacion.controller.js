//liquidaciones

//dependends
const db = require('../database'); //conexión a la base de datos
const helpers = require('../lib/handlebars')

const controller = {}

//lista y suma liquidaciones
controller.getLiquidaciones = async (req, res) => {
  const user = req.user
  //trae todas las liquidaciones
  const sqlLiquidaciones = "SELECT l.id_cliente, t.cliente, t.monto, l.porcentaje, l.comision, l.aseguramiento, l.asesor, l.sucursal, l.abono, l.liquidar, t.zona, t.fecha_tramite FROM liquidaciones AS l JOIN tramites AS t ON t.id = l.id_cliente WHERE l.status = 'open'"

  //get zonas
  const sqlZonas = 'SELECT zona FROM zonas'

  switch (user.permiso) {
    case "Administrador":

      liquidaciones = await db.query(sqlLiquidaciones);

      //?suma los totales de altas
      liquidacionTotal = liquidaciones.reduce((sum, value) => (typeof value.liquidar == "number" ? sum + value.liquidar : sum), 0);
      liquidacionTotal = liquidacionTotal.toFixed(2)

      zonas = await db.query(sqlZonas + ' ORDER BY zona;')

      liquidaciones = helpers.formatterLiquidaciones(liquidaciones)
      liquidacionTotal = helpers.formatterLiquidacionTotal(liquidacionTotal)

      res.render('liquidaciones/list-liquidaciones.hbs', { liquidaciones, liquidacionTotal, zonas })
      break;

    case "Regional":

      liquidaciones = await db.query(sqlLiquidaciones + " AND t.region = ?;", user.region);

      //?suma los totales de las liquidaciones
      liquidacionTotal = liquidaciones.reduce((sum, value) => (typeof value.liquidar == "number" ? sum + value.liquidar : sum), 0);
      liquidacionTotal = liquidacionTotal.toFixed(2)

      zonas = await db.query(sqlZonas + ' WHERE region = ? ORDER BY zona;', user.region)

      liquidaciones = helpers.formatterLiquidaciones(liquidaciones)
      liquidacionTotal = helpers.formatterLiquidacionTotal(liquidacionTotal)

      res.render('liquidaciones/list-liquidaciones.hbs', { liquidaciones, liquidacionTotal, zonas })
      break;

    default:

      liquidaciones = await db.query(sqlLiquidaciones + "AND t.zona = ?;", user.zona);

      //?suma los totales de altas
      liquidacionTotal = liquidaciones.reduce((sum, value) => (typeof value.liquidar == "number" ? sum + value.liquidar : sum), 0);
      liquidacionTotal = liquidacionTotal.toFixed(2)

      liquidaciones = helpers.formatterLiquidaciones(liquidaciones)
      liquidacionTotal = helpers.formatterLiquidacionTotal(liquidacionTotal)

      res.render('liquidaciones/list-liquidaciones.hbs', { liquidaciones, liquidacionTotal })
      break;
  }
};

//lista resulta de busqueda de liquidaciones
controller.postLiquidaciones = async (req, res) => {
  const { folio } = req.body;
  const user = req.user;

  const sqlLiquidaciones = "SELECT l.id_cliente, t.cliente, t.monto, l.porcentaje, l.comision, l.aseguramiento, l.asesor, l.sucursal, l.abono, l.liquidar, t.zona, l.fecha_liquidacion, l.folio, t.fecha_tramite, l.observaciones FROM liquidaciones AS l JOIN tramites AS t ON t.id = l.id_cliente WHERE l.folio = ?"

  if (folio !== '') {

    //Elegir el método de busqueda

    switch (user.permiso) {
      case 'Regional':
        //regional
        liquidaciones = await db.query(sqlLiquidaciones + " AND t.region = ?", [folio, user.region])
        break;

      case 'Administrador':
        //admin
        liquidaciones = await db.query(sqlLiquidaciones, folio)
        break;

      default:
        //encargado
        liquidaciones = await db.query(sqlLiquidaciones + " AND t.zona = ?", [folio, user.zona])
        break;
    }

    if (liquidaciones.length !== 0 && liquidaciones[0].liquidar !== null) {
      zona = liquidaciones[0].zona;

      //formato a fecha de liquidación
      liquidaciones[0].fecha_liquidacion = helpers.formatterFecha(liquidaciones[0].fecha_liquidacion);


      //?suma los totales de las liquidaciones
      liquidacionTotal = liquidaciones.reduce((sum, value) => (typeof value.liquidar == "number" ? sum + value.liquidar : sum), 0);
      liquidacionTotal = liquidacionTotal.toFixed(2)

      //formato a objetos a enviar
      fechaLiquidacion = liquidaciones[0].fecha_liquidacion;
      liquidaciones = helpers.formatterLiquidaciones(liquidaciones)
      liquidacionTotal = helpers.formatterLiquidacionTotal(liquidacionTotal)
      liquidacionFolio = liquidaciones[0].folio
      observaciones = liquidaciones[0].observaciones

      res.render('liquidaciones/liquidacion.hbs', { liquidaciones, liquidacionTotal, zona, fechaLiquidacion, liquidacionFolio, observaciones })
    }
    else {
      req.flash('fail', 'Folio incorrecto');
      res.redirect('/liquidaciones')
    }
  }
  else {
    req.flash('fail', 'Escribe el folio de la liquidación');
    res.redirect('/liquidaciones')
  }
}

//valida si existe liquidacion render tipo liquidación (from botón liquidar)
controller.getLiquidar = async (req, res) => {
  const { id } = req.params

  const sqlValidarLiquidacion = 'SELECT id_cliente FROM liquidaciones WHERE id_cliente = ?;'
  const validarLiquidacion = await db.query(sqlValidarLiquidacion, id)

  if (validarLiquidacion.length !== 0) {
    req.flash('fail', 'Cliente ya en liquidación')
    res.redirect('/liquidaciones')
  }

  //creando el tipo de objeto segun usuario para la eleccion de la liquidacion
  else {
    const user = req.user
    const sqlCustomer = 'SELECT id, cliente FROM tramites WHERE id = ?;'
    customer = await db.query(sqlCustomer, id)

    //liquidacion como socio cobrando el 25% y sucursal (liquidacion integra)
    if (user.zona !== 'Campeche3' && user.zona !== 'Tizimin' && user.zona !== 'Escarcega' && user.zona !== 'Champotón' && user.zona !== 'Palenque' && user.zona !== 'Campeche') {
      tipoLiquidacion = [
        {
          liquidacion: 'Socio'
        },
        {
          liquidacion: 'Local'
        },
        {
          liquidacion: 'Sucursal'
        }
      ]

    }
    //liquidacion fornea cobra 30%
    else if (user.zona == 'Escarcega' || user.zona == 'Champotón' || user.zona == 'Palenque') {
      tipoLiquidacion = [
        {
          liquidacion: 'Foránea'
        },
        {
          liquidacion: 'Sucursal Foránea'
        }
      ]
    }
    //liquidacion local descuenta lo del asesor
    else if (user.zona == 'Campeche') {
      tipoLiquidacion = [
        {
          liquidacion: 'Local'
        },
        {
          liquidacion: 'Sucursal'
        }
      ]
    }
    //liquidacion como socio cobrando el 20% y local (Campeche3 & Tizimin)
    else {
      tipoLiquidacion = [
        {
          liquidacion: 'Especial'
        },
        {
          liquidacion: 'Sucursal Especial'
        }
      ]
    }

    res.render('liquidaciones/type-liquidacion.hbs', { customer: customer[0], tipoLiquidacion })
  }
};

//recibe liquidación a agregar (from tipo de liquidación)
controller.postLiquidar = async (req, res) => {
  const { id } = req.params;
  let { tipo, abono } = req.body;

  //objeto con el status y el motivo para actualizar trámite
  const updateStatus = {
    status: 'Liquidar',
    motivo: null
  }

  //actualizo el status
  const sqlUpdate = 'UPDATE tramites SET ? WHERE id = ?'
  await db.query(sqlUpdate, [updateStatus, id])

  //parsea abono
  if (abono != '') {
    abono = parseInt(abono)
  }
  else {
    abono = 0
  }

  //monto a usar en liquidación
  const sqlLiquidacion = 'SELECT monto FROM tramites WHERE id = ?;'
  let liquidacion = await db.query(sqlLiquidacion, [id])

  // calcula la liquidación y crea el objeto que ira a la bd
  let createLiquidar = helpers.liquidacion(liquidacion[0].monto, tipo, abono)

  //agrega el id_cliente al objeto con la liquidacion
  createLiquidar.id_cliente = id

  //guardo liquidación
  const sqlSaveLiquidacion = 'INSERT INTO liquidaciones SET ?'
  await db.query(sqlSaveLiquidacion, [createLiquidar])

  req.flash('success', 'Cliente agregado a liquidación')
  res.redirect('/liquidaciones')
};

//liquidación por zona
controller.postLiquidarZona = async (req, res) => {
  const { zona } = req.body;

  //trae todas las liquidaciones por zona
  const sqlLiquidaciones = "SELECT l.id_cliente, t.cliente, t.monto, l.porcentaje, l.comision, l.aseguramiento, l.asesor, l.sucursal, l.abono, l.liquidar, t.zona, t.fecha_tramite FROM liquidaciones AS l JOIN tramites AS t ON t.id = l.id_cliente WHERE l.status = 'open' AND t.zona = ?"

  let liquidaciones = await db.query(sqlLiquidaciones, zona)

  //?suma los totales de las liquidaciones
  liquidacionTotal = liquidaciones.reduce((sum, value) => (typeof value.liquidar == "number" ? sum + value.liquidar : sum), 0);
  liquidacionTotal = liquidacionTotal.toFixed(2)

  liquidaciones = helpers.formatterLiquidaciones(liquidaciones)
  liquidacionTotal = helpers.formatterLiquidacionTotal(liquidacionTotal)

  res.render('liquidaciones/liquidacion.hbs', { liquidaciones, liquidacionTotal, zona })
}

//agrega observaciones para cerrar liquidación
controller.getClosed = async (req, res) => {
  const user = req.user;
  let zona = req.query.zona;
  const sqlLiquidaciones = "SELECT l.id_cliente FROM liquidaciones AS l JOIN tramites AS t ON t.id = l.id_cliente WHERE l.status = 'open' AND t.zona = ?"

  //En caso que el permiso sea temporal
  if (zona.length === 0) {
    zona = user.zona
  }

  const liquidaciones = await db.query(sqlLiquidaciones, zona)

  if (liquidaciones.length != 0) {
    if (user.permiso !== 'Encargado') {
      res.render('liquidaciones/observacion-liquidacion.hbs', { zona })
    }
    else {
      req.flash('fail', 'Sin permiso suficiente')
      res.redirect('/liquidaciones')
    }
  }
  else {
    req.flash('fail', 'Sin liquidaciones abiertas')
    res.redirect('/liquidaciones')
  }
}

controller.postClosed = async (req, res) => {
  let zona = req.query.zona;
  let { observaciones } = req.body;
  const user = req.user;
  const fechaActual = new Date();

  let sqlLiquidaciones = "SELECT l.id_cliente FROM liquidaciones AS l JOIN tramites AS t ON t.id = l.id_cliente WHERE l.status = 'open' AND t.zona = ?"

  //En caso que el permiso sea temporal
  if (zona.length === 0) {
    zona = user.zona
  }

  // Consulta liquidaciones abiertas
  let liquidaciones = await db.query(sqlLiquidaciones, zona)

  if (liquidaciones.length !== 0) {

    sqlLiquidaciones = "SELECT l.id_cliente, t.cliente, t.monto, l.porcentaje, l.comision, l.aseguramiento, l.asesor, l.sucursal, l.abono, l.liquidar, t.zona, l.fecha_liquidacion, l.folio, t.fecha_tramite, l.observaciones FROM liquidaciones AS l JOIN tramites AS t ON t.id = l.id_cliente WHERE l.folio = ?"

    //número para generar el folio aleatorio
    numeroAleatorio = liquidaciones[0].id_cliente

    // Creo folio
    let folio = 'F-' + (fechaActual.getMonth() + 1) + helpers.numAleatorio(numeroAleatorio, 1);

    //objeto con el folio para cerrar liquidación
    const closeLiquidacion = {
      status: 'closed',
      fecha_liquidacion: fechaActual,
      folio,
      observaciones,
      cierre: user.fullname
    }

    //cierro liquidaciones
    for (let i = 0; i < liquidaciones.length; i++) {
      let idcliente = liquidaciones[i].id_cliente
      const sqlCloseLiquidacion = 'UPDATE liquidaciones SET ? WHERE id_cliente = ?;';

      await db.query(sqlCloseLiquidacion, [closeLiquidacion, idcliente])
    }

    //consulto liquidación finalizada
    liquidaciones = await db.query(sqlLiquidaciones, folio)

    //objeto con el status y el motivo para actualizar trámite
    const updateStatus = {
      status: 'Finalizado',
      fecha_status: fechaActual,
      fecha_solucion: fechaActual
    }

    //cambio status tramites
    for (let i = 0; i < liquidaciones.length; i++) {
      let idcliente = liquidaciones[i].id_cliente

      const sqlCloseLiquidacion = 'UPDATE tramites SET ? WHERE id = ?;';

      await db.query(sqlCloseLiquidacion, [updateStatus, idcliente])
    }

    //formato a fecha de liquidación
    liquidaciones[0].fecha_liquidacion = helpers.formatterFecha(liquidaciones[0].fecha_liquidacion);

    //?suma los totales de las liquidaciones
    liquidacionTotal = liquidaciones.reduce((sum, value) => (typeof value.liquidar == "number" ? sum + value.liquidar : sum), 0);
    liquidacionTotal = liquidacionTotal.toFixed(2)

    //formato a objetos a enviar
    fechaLiquidacion = liquidaciones[0].fecha_liquidacion;
    liquidaciones = helpers.formatterLiquidaciones(liquidaciones)
    liquidacionTotal = helpers.formatterLiquidacionTotal(liquidacionTotal)
    liquidacionFolio = liquidaciones[0].folio
    observaciones = liquidaciones[0].observaciones

    res.render('liquidaciones/liquidacion.hbs', { liquidaciones, liquidacionTotal, zona, fechaLiquidacion, liquidacionFolio, observaciones })
  }
  else {
    req.flash('fail', 'Sin liquidaciones abiertas')
    res.redirect('/liquidaciones')
  }
}

module.exports = controller;