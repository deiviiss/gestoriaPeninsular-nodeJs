//Fuctions

const helpers = {} //objeto a utilizar desde las vistas

//métodos del objeto

//*funciones formato
//convierte la moneda en numero
// helpers.formatterNumber = (monto) => {

//   monto = monto.replace(",", "")
//   monto = parseFloat(monto.slice(1, -3))
//   return monto
// }

// convierte el numero en moneda
helpers.formatterPeso = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

//Formato fecha (dd/mes/yy)
helpers.formatterFecha = (fecha) => {
  let month = new Array(); //Array que contiene los meses
  month[0] = "Enero";
  month[1] = "Febrero";
  month[2] = "Marzo";
  month[3] = "Abril";
  month[4] = "Mayo";
  month[5] = "Junio";
  month[6] = "Julio";
  month[7] = "Agosto";
  month[8] = "Septiembre";
  month[9] = "Octubre";
  month[10] = "Noviembre";
  month[11] = "Diciembre";

  fecha = fecha.getDate() + '/' + month[fecha.getMonth()] + '/' + fecha.getFullYear()

  return fecha
}

//Formato a clientes (moneda, fechas)
helpers.formatterCustomers = (customer) => {

  if (customer.length > 0) {
    //recorrer para acceder a propiedades
    for (var i = 0; i < customer.length; i++) {

      let montoPeso = (customer[i].monto)
      let fechaTramite = (customer[i].fecha_tramite)
      let fechaRetiro = (customer[i].fecha_ultimo_retiro)
      let fechaSolucion = (customer[i].fecha_solucion)
      let fechaStatus = (customer[i].fecha_status)
      let fechaCaptura = (customer[i].fecha_captura)
      let infonavit = customer[i].infonavit

      //infonavit
      if (infonavit === 1) {
        customer[i].infonavit = 'Sí'
      }
      else {
        customer[i].infonavit = 'No'
      }

      //monto
      customer[i].monto = helpers.formatterPeso.format(montoPeso)

      //* condiciona las fechas null
      //Fecha de trámite
      if (fechaTramite != null || fechaTramite != undefined) {
        customer[i].fecha_tramite = helpers.formatterFecha(fechaTramite)
      }
      else {
        customer[i].fecha_tramite = 'Sin asignar'
      }

      //Fecha de último retiro
      if (fechaRetiro != null || fechaRetiro != undefined) {
        customer[i].fecha_ultimo_retiro = helpers.formatterFecha(fechaRetiro)
      }
      else {
        customer[i].fecha_ultimo_retiro = 'Sin retiro'
      }

      //Fecha de status
      if (fechaStatus != null || fechaStatus != undefined) {
        customer[i].fecha_status = helpers.formatterFecha(fechaStatus)
      }
      else {
        customer[i].fecha_status = 'Sin fecha'
      }

      //Fecha de solución
      if (fechaSolucion != null || fechaSolucion != undefined) {
        customer[i].fecha_solucion = helpers.formatterFecha(fechaSolucion)
      }
      else {
        customer[i].fecha_solucion = 'En espera'
      }

      //Fecha de captura
      if (fechaCaptura != null || fechaCaptura != undefined) {
        customer[i].fecha_captura = helpers.formatterFecha(fechaCaptura)
      }

    }
    return customer
  }
}

//Formato a altas (fecha)
helpers.formatterEditAlta = (customer) => {

  if (customer.length > 0) {
    //recorrer para acceder a propiedades
    for (let i = 0; i < customer.length; i++) {

      let fechaRetiro = customer[i].fecha_ultimo_retiro

      //valida si hay fecha convierte a yy-mm-dd
      if (fechaRetiro != null) {
        fechaRetiro = fechaRetiro.toLocaleDateString('en-GB');
        fechaRetiro = fechaRetiro.split("/").reverse().join("-")
        customer[i].fecha_ultimo_retiro = fechaRetiro
      }
    }
  }

  return customer
};

//Formato a liquidaciones
helpers.formatterLiquidaciones = (liquidaciones) => {
  //recorrer para acceder a propiedades
  for (var i = 0; i < liquidaciones.length; i++) {

    let montoPeso = liquidaciones[i].monto;
    let comision = liquidaciones[i].comision;
    let aseguramiento = liquidaciones[i].aseguramiento;
    let asesor = liquidaciones[i].asesor;
    let sucursal = liquidaciones[i].sucursal;
    let sinAbono = liquidaciones[i].sinAbono;
    let abono = liquidaciones[i].abono;
    let liquidar = liquidaciones[i].liquidar;
    let fechaTramite = liquidaciones[i].fecha_tramite;

    //monto
    liquidaciones[i].monto = helpers.formatterPeso.format(montoPeso)
    liquidaciones[i].comision = helpers.formatterPeso.format(comision);
    liquidaciones[i].aseguramiento = helpers.formatterPeso.format(aseguramiento);
    liquidaciones[i].asesor = helpers.formatterPeso.format(asesor);
    liquidaciones[i].liquidar = helpers.formatterPeso.format(liquidar);
    liquidaciones[i].fecha_tramite = helpers.formatterFecha(fechaTramite);

    if (abono !== null) {
      liquidaciones[i].abono = helpers.formatterPeso.format(abono);
    }
    else {
      liquidaciones[i].abono = 'No aplica'
    }

    if (sucursal !== null) {
      liquidaciones[i].sucursal = helpers.formatterPeso.format(sucursal);
    }
    else {
      liquidaciones[i].sucursal = 'No aplica'
    }
  }

  return liquidaciones;
}

helpers.formatterLiquidacionTotal = (liquidacionTotal) => {

  //total liquidacion
  liquidacionTotal = helpers.formatterPeso.format(liquidacionTotal)

  return liquidacionTotal;
}

//*funciones costos
//Campeche, Campeche2 Campoeche3 
helpers.costoLocal = (cantidad) => {
  let cobro
  let aseguramiento
  let cobroCliente
  let libreCliente

  if (cantidad > 42509) {
    cobro = cantidad * .30
    aseguramiento = 'Incluido'
    cobroCliente = cobro
    libreCliente = cantidad - cobro
  }
  else if (cantidad > 25001) {
    cobro = cantidad * .25
    aseguramiento = 2000
    cobroCliente = cobro + aseguramiento
    libreCliente = cantidad - cobroCliente
  }
  else if (cantidad > 15001) {
    cobro = cantidad * .25
    aseguramiento = 1700
    cobroCliente = cobro + aseguramiento
    libreCliente = cantidad - cobroCliente
  }
  else if (cantidad > 0) {
    cobro = cantidad * .25
    aseguramiento = 1300
    cobroCliente = cobro + aseguramiento
    libreCliente = cantidad - cobroCliente
  }

  //  formato moneda
  montoPesos = helpers.formatterPeso.format(cantidad)
  cobroPesos = helpers.formatterPeso.format(cobro)
  if (aseguramiento === 'Incluido') {
    aseguramientoPesos = 'Incluido'
  }
  else {
    aseguramientoPesos = helpers.formatterPeso.format(aseguramiento)
  }
  cobroClientePesos = helpers.formatterPeso.format(cobroCliente)
  libreClientePesos = helpers.formatterPeso.format(libreCliente)

  // objeto que recibe la vista result
  retiro = {
    montoPesos,
    cobroPesos,
    aseguramientoPesos,
    cobroClientePesos,
    libreClientePesos,
  }
  return (retiro)
}

//Cancun, Cancun2, Carmen, Carmen2, Chetumal, Coatzacoalcos, Cozumel, Cuautitlán, Cuernavaca2, Ixtapaluca, Playa, Polanco, Tizimín, Valladolid, Villahermosa
helpers.costoforaneo1 = (cantidad) => {
  let cobro
  let aseguramiento
  let cobroCliente
  let libreCliente

  if (cantidad > 30801) {
    cobro = cantidad * .30
    aseguramiento = 'Incluido'
    cobroCliente = cobro
    libreCliente = cantidad - cobro
  }
  else if (cantidad > 24999) {
    cobro = cantidad * .25
    aseguramiento = 2000
    cobroCliente = cobro + aseguramiento
    libreCliente = cantidad - cobroCliente
  }
  else if (cantidad > 15001) {
    cobro = cantidad * .25
    aseguramiento = 1700
    cobroCliente = cobro + aseguramiento
    libreCliente = cantidad - cobroCliente
  }
  else if (cantidad > 0) {
    cobro = cantidad * .25
    aseguramiento = 1300
    cobroCliente = cobro + aseguramiento
    libreCliente = cantidad - cobroCliente
  }

  //  formato moneda
  montoPesos = helpers.formatterPeso.format(cantidad)
  cobroPesos = helpers.formatterPeso.format(cobro)
  if (aseguramiento === 'Incluido') {
    aseguramientoPesos = 'Incluido'
  }
  else {
    aseguramientoPesos = helpers.formatterPeso.format(aseguramiento)
  }
  cobroClientePesos = helpers.formatterPeso.format(cobroCliente)
  libreClientePesos = helpers.formatterPeso.format(libreCliente)

  // objeto que recibe la vista result
  retiro = {
    montoPesos,
    cobroPesos,
    aseguramientoPesos,
    cobroClientePesos,
    libreClientePesos,
  }
  return (retiro)
}

//Escarcega, Palenque, Champotón, Candelaria
helpers.costoforaneo2 = (cantidad) => {
  let cobro
  // let aseguramiento
  let cobroCliente
  let libreCliente

  cobro = cantidad * .30
  // aseguramiento = 'Incluido'
  cobroCliente = cobro
  libreCliente = cantidad - cobro

  //  formato moneda
  montoPesos = helpers.formatterPeso.format(cantidad)
  cobroPesos = helpers.formatterPeso.format(cobro)
  aseguramientoPesos = 'Incluido'
  cobroClientePesos = helpers.formatterPeso.format(cobroCliente)
  libreClientePesos = helpers.formatterPeso.format(libreCliente)

  // objeto que recibe la vista result
  retiro = {
    montoPesos,
    cobroPesos,
    aseguramientoPesos,
    cobroClientePesos,
    libreClientePesos,
  }
  return (retiro)
}

//valida la sucursal
helpers.cotizacion = (cantidad, sucursal) => {

  if (sucursal == "Campeche" || sucursal == "Campeche2" || sucursal == "Campeche3") {
    helpers.costoLocal(cantidad)
  }
  else if (sucursal == "Cancun" || sucursal == "Cancun2" || sucursal == "Carmen" || sucursal == "Carmen2" || sucursal == "Chetumal" || sucursal == "Coatzacoalcos" || sucursal == "Cozumel" || sucursal == "Cuautitlán" || sucursal == "Cuernavaca" || sucursal == "Cuernavaca2" || sucursal == "Ixtapaluca" || sucursal == "Mérida" || sucursal == "Playa del Carmen" || sucursal == "Playa del Carmen2" || sucursal == "Playa del Carmen3" || sucursal == "Polanco" || sucursal == "Tizimín" || sucursal == "Valladolid" || sucursal == "Villahermosa") {

    helpers.costoforaneo1(cantidad)
  }
  else if (sucursal == "Champotón" || sucursal == "Candelaria" || sucursal == "Escarcega" || sucursal == "Palenque") {
    helpers.costoforaneo2(cantidad)
  }

}

//Valida el usuario para validar si usa body o user
helpers.calculaCosto = (body, user) => {

  if (user.permiso === "Encargado" || user.permiso === "Temporal") {
    let cantidad = body.montoRetiro
    let sucursal = user.zona

    helpers.cotizacion(cantidad, sucursal)
  }
  else {
    let cantidad = body.montoRetiro
    let sucursal = body.zona
    helpers.cotizacion(cantidad, sucursal)
  }
}

//genera número aleatorio para el folio de liquidación
helpers.numAleatorio = (max, min) => {
  let numPosibilidaes = max * min;
  let aleatorio = Math.random() * (numPosibilidaes + 1);
  aleatorio = Math.floor(aleatorio);
  return min + aleatorio
}

//*funciones liquidaciones

//Se divide entre 3
helpers.liquidacionSocio = (monto, abono) => {
  let porcentaje;
  let comision;
  let aseguramiento;
  let asesor;
  let sucursal;
  let sinAbono;
  let liquidar;

  if (monto > 30801) {
    porcentaje = .30
    comision = monto * porcentaje
    aseguramiento = 2000
    asesor = monto * .05
    sucursal = (comision - 2000) / 3
    sinAbono = sucursal + aseguramiento
    liquidar = sinAbono + abono
  }
  else if (monto > 24999) {
    porcentaje = .25
    comision = monto * porcentaje
    aseguramiento = 2000
    asesor = monto * .05
    sucursal = comision / 3
    sinAbono = sucursal + aseguramiento
    liquidar = sinAbono + abono
  }

  else if (monto > 15001) {
    porcentaje = .25
    comision = monto * porcentaje
    aseguramiento = 1700
    asesor = monto * .05
    sucursal = comision / 3
    sinAbono = sucursal + aseguramiento
    liquidar = sinAbono + abono
  }
  else if (monto > 0) {
    porcentaje = .25
    comision = monto * porcentaje
    aseguramiento = 1300
    asesor = monto * .05
    sucursal = comision / 3
    sinAbono = sucursal + aseguramiento
    liquidar = sinAbono + abono
  }

  liquidacion = {
    monto,
    porcentaje: porcentaje * 100,
    comision,
    aseguramiento,
    asesor,
    sucursal,
    abono,
    sin_abono: sinAbono,
    liquidar
  }

  return liquidacion
};

//Se descuenta lo del asesor
helpers.liquidacionLocal = (monto) => {
  let porcentaje;
  let comision;
  let aseguramiento;
  let asesor;
  let liquidar;

  if (monto > 30801) {
    porcentaje = .30
    comision = monto * porcentaje
    aseguramiento = 2000
    asesor = monto * .05
    liquidar = comision - asesor
  }
  else if (monto > 24999) {
    porcentaje = .25
    comision = monto * porcentaje
    aseguramiento = 2000
    asesor = monto * .05
    liquidar = (comision + aseguramiento) - asesor
  }

  else if (monto > 15001) {
    porcentaje = .25
    comision = monto * porcentaje
    aseguramiento = 1700
    asesor = monto * .05
    liquidar = (comision + aseguramiento) - asesor
  }
  else if (monto > 0) {
    porcentaje = .25
    comision = monto * porcentaje
    aseguramiento = 1300
    asesor = monto * .05
    liquidar = (comision + aseguramiento) - asesor
  }

  liquidacion = {
    monto,
    porcentaje: porcentaje * 100,
    comision,
    aseguramiento,
    asesor,
    liquidar
  }

  return liquidacion
};

//Se cobra el 30%
helpers.liquidacionForanea = (monto) => {
  let porcentaje;
  let comision;
  let asesor;
  let liquidar;

  porcentaje = .30
  comision = monto * porcentaje
  asesor = monto * .05
  liquidar = comision - asesor

  liquidacion = {
    monto,
    porcentaje: porcentaje * 100,
    comision,
    asesor,
    liquidar
  }

  return liquidacion
};

//Se cobra el 20%
helpers.liquidacionEspecial = (monto, abono) => {
  let porcentaje;
  let comision;
  let aseguramiento;
  let asesor;
  let sucursal;
  let sinAbono;
  let liquidar;

  if (monto > 30801) {
    porcentaje = .25
    comision = monto * porcentaje
    aseguramiento = 2000
    asesor = monto * .05
    sucursal = (comision - 2000) / 3
    sinAbono = sucursal + aseguramiento
    liquidar = sinAbono + abono
  }
  else if (monto > 24999) {
    porcentaje = .20
    comision = monto * porcentaje
    aseguramiento = 2000
    asesor = monto * .05
    sucursal = comision / 3
    sinAbono = sucursal + aseguramiento
    liquidar = sinAbono + abono
  }

  else if (monto > 15001) {
    porcentaje = .20
    comision = monto * porcentaje
    aseguramiento = 1700
    asesor = monto * .05
    sucursal = comision / 3
    sinAbono = sucursal + aseguramiento
    liquidar = sinAbono + abono
  }
  else if (monto > 0) {
    porcentaje = .20
    comision = monto * porcentaje
    aseguramiento = 1300
    asesor = monto * .05
    sucursal = comision / 3
    sinAbono = sucursal + aseguramiento
    liquidar = sinAbono + abono
  }

  liquidacion = {
    monto,
    porcentaje: porcentaje * 100,
    comision,
    aseguramiento,
    asesor,
    sucursal,
    abono,
    sin_abono: sinAbono,
    liquidar
  }

  return liquidacion
};

//?Otras sucursales

//Clientes de otra sucursal 25%
helpers.liquidacionSucursalLocal = (monto) => {
  let porcentaje;
  let comision;
  let aseguramiento;
  let asesor;
  let liquidar;

  if (monto > 30801) {
    porcentaje = .30
    comision = monto * porcentaje
    aseguramiento = 2000
    asesor = 0
    liquidar = comision + aseguramiento
  }
  else if (monto > 24999) {
    porcentaje = .25
    comision = monto * porcentaje
    aseguramiento = 2000
    asesor = 0
    liquidar = comision + aseguramiento
  }

  else if (monto > 15001) {
    porcentaje = .25
    comision = monto * porcentaje
    aseguramiento = 1700
    asesor = 0
    liquidar = comision + aseguramiento
  }
  else if (monto > 0) {
    porcentaje = .25
    comision = monto * porcentaje
    aseguramiento = 1300
    asesor = 0
    liquidar = comision + aseguramiento
  }

  liquidacion = {
    monto,
    porcentaje: porcentaje * 100,
    comision,
    aseguramiento,
    asesor,
    liquidar
  }

  return liquidacion
};

//Clientes de otra sucursal 20%
helpers.liquidacionSucursalEspecial = (monto) => {
  let porcentaje;
  let comision;
  let aseguramiento;
  let asesor;
  let liquidar;

  if (monto > 30801) {
    porcentaje = .25
    comision = monto * porcentaje
    aseguramiento = 2000
    asesor = 0
    liquidar = comision + aseguramiento
  }
  else if (monto > 24999) {
    porcentaje = .20
    comision = monto * porcentaje
    aseguramiento = 2000
    asesor = 0
    liquidar = comision + aseguramiento
  }

  else if (monto > 15001) {
    porcentaje = .20
    comision = monto * porcentaje
    aseguramiento = 1700
    asesor = 0
    liquidar = comision + aseguramiento
  }
  else if (monto > 0) {
    porcentaje = .20
    comision = monto * porcentaje
    aseguramiento = 1300
    asesor = 0
    liquidar = comision + aseguramiento
  }

  liquidacion = {
    monto,
    porcentaje: porcentaje * 100,
    comision,
    aseguramiento,
    asesor,
    liquidar
  }

  return liquidacion
};

//Clientes de otra sucursal 30%
helpers.liquidacionSucursalForanea = (monto) => {
  let porcentaje;
  let comision;
  let asesor;
  let liquidar;

  porcentaje = .30
  comision = monto * porcentaje
  asesor = 0
  aseguramiento = 0
  liquidar = comision


  liquidacion = {
    monto,
    porcentaje: porcentaje * 100,
    comision,
    aseguramiento,
    asesor,
    liquidar
  }

  return liquidacion
};

//Agrega clientes asegurados a la liquidación
helpers.liquidacionAseguramiento = (monto) => {
  if (monto > 30801) {
    aseguramiento = 2000
  }
  else if (monto > 24999) {
    aseguramiento = 2000
  }

  else if (monto > 15001) {
    aseguramiento = 1700
  }
  else if (monto > 0) {
    aseguramiento = 1300
  }

  liquidacion = {
    monto,
    porcentaje: 0,
    comision: 0,
    aseguramiento,
    asesor: 0,
    sucursal: 0,
    abono: 0,
    sin_abono: 0,
    liquidar: aseguramiento
  }

  return liquidacion
}

//elige tipo de liquidacion
helpers.liquidacion = (monto, tipo, abono) => {

  switch (tipo) {
    case "Local":
      helpers.liquidacionLocal(monto)
      break;
    case "Socio":
      helpers.liquidacionSocio(monto, abono)
      break;
    case "Foránea":
      helpers.liquidacionForanea(monto)
      break;
    case "Especial":
      helpers.liquidacionEspecial(monto, abono)
      break;
    case "Sucursal":
      helpers.liquidacionSucursalLocal(monto)
      break;
    case "Sucursal Foránea":
      helpers.liquidacionSucursalForanea(monto)
      break;
    case "Sucursal Especial":
      helpers.liquidacionSucursalEspecial(monto)
      break;
  }

  return liquidacion;
};

module.exports = helpers;