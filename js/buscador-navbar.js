/* Buscador IA — Panel navbar con asistente inteligente */

/* ---- Utilidades ---- */
function _sbNorm(s) {
    return String(s).toLowerCase()
        .replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i')
        .replace(/ó/g,'o').replace(/ú/g,'u').replace(/ñ/g,'n');
}
function _sbEsc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function _sbFmt(n) {
    return 'Q ' + Number(n).toLocaleString('es-GT');
}

/* ---- Base de conocimiento ---- */
var _sbKnow = {
    tipos: {
        suv:      { desc: 'Ideal para familias: amplio, seguro y versátil. Disponible en versiones 4x2 y 4x4 para ciudad o campo.' },
        pickup:   { desc: 'La mejor opción para trabajo y carga. Alta resistencia y capacidad de remolque. Las versiones 4x4 conquistan cualquier terreno.' },
        sedan:    { desc: 'El clásico vehículo de ciudad: económico en combustible, cómodo y fácil de estacionar.' },
        camioneta:{ desc: 'Combina la comodidad de un sedán con algo más de espacio. Ideal para ciudad con viajes ocasionales.' }
    },
    marcas: {
        toyota:    'Toyota lidera en confiabilidad y valor de reventa. Amplia disponibilidad de repuestos en Guatemala. Modelos destacados: Corolla, Hilux, RAV4, Land Cruiser.',
        honda:     'Honda destaca por eficiencia y tecnología. Excelente economía de combustible. Modelos destacados: Civic, CR-V, HR-V, Pilot.',
        nissan:    'Nissan ofrece buena relación precio-calidad con variedad de modelos. Modelos destacados: Sentra, X-Trail, Frontier, Navara.',
        ford:      'Ford es referencia en pickups y camionetas de trabajo. Reconocida por su robustez. Modelos destacados: F-150, Ranger, Explorer.',
        chevrolet: 'Chevrolet tiene amplia red de servicio en Guatemala. Variedad desde sedanes hasta pickups. Modelos destacados: Silverado, Colorado, Equinox, Trailblazer.'
    },
    transmision: {
        automatica: 'La transmisión <b>automática</b> es más cómoda en ciudad y tráfico. No necesitas usar embrague y el arranque en pendientes es más fácil. Suele tener un precio ligeramente mayor.',
        manual:     'La transmisión <b>manual</b> te da mayor control. Generalmente más económica y con menor mantenimiento a largo plazo. Preferida para trabajo en campo o carretera.'
    },
    financiamiento: 'En <b>Expedia Motors</b> ofrecemos asesoría en planes de financiamiento a través de diferentes entidades bancarias en Guatemala.<br><br>El proceso incluye evaluación de crédito, enganche y cuotas mensuales adaptadas a tu presupuesto. Visita nuestra sección de <a href="financiamiento.html" style="color:#FF8800">financiamiento</a> o contáctanos para más información.',
    contacto:      'Puedes comunicarte con nosotros por:<br><b>📞 WhatsApp: +502 3569-5967</b><br><br>También puedes enviarnos un mensaje desde nuestra <a href="contactus.html" style="color:#FF8800">página de contacto</a> o visitarnos directamente.',
    garantia:      'Los vehículos <b>nuevos</b> incluyen garantía completa de fábrica según la marca. Los vehículos <b>usados</b> son revisados e inspeccionados antes de la venta. Consulta los detalles de cada unidad con nuestro equipo.',
    nuevo_vs_usado:'Un vehículo <b>nuevo</b> tiene garantía completa, 0 km y los últimos equipamientos. Un vehículo <b>usado</b> ofrece un precio más accesible y menor depreciación inmediata. Ambos son buenas opciones según tu presupuesto.'
};

/* ---- Parseo y búsqueda en inventario ---- */
function _sbParsear(texto) {
    var t = _sbNorm(texto), f = {};
    ['toyota','honda','nissan','ford','chevrolet'].forEach(function(m) {
        if (t.indexOf(m) !== -1) f.marca = m;
    });
    var tipos = {
        'suv':'suv','pickup':'pickup','pick up':'pickup',
        'camioneta':'camioneta','sedan':'sedan','sedán':'sedan',
        'coupe':'coupe','cupé':'coupe'
    };
    Object.keys(tipos).forEach(function(k) {
        if (t.indexOf(k) !== -1) f.tipo = tipos[k];
    });
    if (t.indexOf('automatico') !== -1 || t.indexOf('automatica') !== -1) f.transmision = 'automatico';
    if (t.indexOf('manual') !== -1) f.transmision = 'manual';
    if (t.indexOf('nuevo') !== -1 || t.indexOf('nueva') !== -1) f.condicion = 'nuevo';
    if (t.indexOf('usado') !== -1 || t.indexOf('usada') !== -1) f.condicion = 'usado';
    return f;
}

function _sbBuscar(texto) {
    if (typeof INVENTARIO === 'undefined') return null;
    var filtros = _sbParsear(texto);
    if (Object.keys(filtros).length === 0) {
        var t = _sbNorm(texto);
        return INVENTARIO.filter(function(v) {
            return _sbNorm(v.marca).indexOf(t)   !== -1 ||
                   _sbNorm(v.linea).indexOf(t)   !== -1 ||
                   _sbNorm(v.tipo).indexOf(t)    !== -1 ||
                   _sbNorm(v.version).indexOf(t) !== -1;
        });
    }
    return INVENTARIO.filter(function(v) {
        return (!filtros.marca       || _sbNorm(v.marca)       === filtros.marca)       &&
               (!filtros.tipo        || _sbNorm(v.tipo)        === filtros.tipo)        &&
               (!filtros.transmision || _sbNorm(v.transmision) === filtros.transmision) &&
               (!filtros.condicion   || _sbNorm(v.condicion)   === filtros.condicion);
    });
}

/* ---- Detección de intención ---- */
function _sbIntencion(t) {
    /* Intenciones específicas primero — saludo/gracias al final para no tapar otras peticiones */
    if (/\b(familia|ninos|hijos|espacio|amplio|7 asientos|7 pasajeros|varios pasajeros|caben varios|pasajeros)\b/.test(t)) return 'familia';
    if (/\b(trabajo|carga|transporte|construccion|negocio|empresa|material|herramienta|cargo|batea|toneladas)\b/.test(t)) return 'trabajo';
    if (/\b(ciudad|trafico|parquear|economico|economica|gasolina|combustible|consumo|urbano|diario)\b/.test(t)) return 'ciudad';
    if (/\b(campo|montaña|tierra|4x4|traccion|off road|offroad|camino de tierra|barro|rio|quebrada)\b/.test(t)) return 'campo';
    if (/\b(credito|financiamiento|financiar|cuotas|enganche|mensualidad|prestamo|banco|pagar a plazos|abonos|plazos)\b/.test(t)) return 'financiamiento';
    if (/\b(garantia|garantizado|garantias)\b/.test(t)) return 'garantia';
    if (/\b(contacto|telefono|numero|llamar|visitar|showroom|ubicacion|donde estan|donde queda|direccion|whatsapp)\b/.test(t)) return 'contacto';
    if (/\b(diferencia|comparar|versus|vs|mejor entre|cual es mejor|comparacion|comparame|que diferencia)\b/.test(t)) return 'comparacion';
    if (/\b(automatico|automatica|manual|transmision|tipo de cambio|caja automatica|caja manual)\b/.test(t)) return 'transmision';
    if (/\b(nuevo|nueva|usado|usada|km0|cero kilometros|segunda mano|0 km)\b/.test(t)) return 'condicion';
    if (/\b(que tienen|que vehiculos|muestrame|mostrame|mostrar|muestra|quiero ver|ver todo|ensenami|catalogo|todo el inventario|cuantos tienen|que opciones|que modelos|disponibles)\b/.test(t)) return 'inventario';
    if (/\b(cuanto cuesta|cual es el precio|precio de|valor de|cuanto vale|cuanto es|precios)\b/.test(t)) return 'precio';
    var marcasSolas = [];
    ['toyota','honda','nissan','ford','chevrolet'].forEach(function(m) {
        if (t.indexOf(m) !== -1) marcasSolas.push(m);
    });
    if (marcasSolas.length > 0 && /\b(cuentame|informacion|como es|que tal|que opinan|recomiendan|me recomiendas|que saben|info)\b/.test(t)) return 'info_marca';
    /* Saludos al final: si el mensaje tiene otro intent, este nunca se alcanza */
    if (/\b(gracias|muchas gracias|perfecto|excelente|muy bien|genial|de acuerdo)\b/.test(t)) return 'gracias';
    if (/\b(hola|buenos dias|buenos tardes|buenas noches|buenas|hi|hey|saludos|buen dia)\b/.test(t)) return 'saludo';
    return null;
}

/* ---- Respuestas por intención ---- */
function _sbRespuesta(intencion, t, textoOriginal) {
    var inv = typeof INVENTARIO !== 'undefined';

    switch (intencion) {
        case 'saludo':
            return { msg: '¡Hola! Bienvenido a <b>Expedia Motors</b>. ¿En qué puedo ayudarte?<br><br>Puedo orientarte para encontrar el vehículo ideal, responder preguntas sobre marcas, modelos o financiamiento, y mostrarte nuestro inventario disponible.' };

        case 'gracias':
            return { msg: '¡Con mucho gusto! Estoy aquí para lo que necesites. Si quieres ver más opciones o tienes alguna pregunta, no dudes en escribirme. 😊' };

        case 'familia': {
            var resFam = inv ? INVENTARIO.filter(function(v){ return _sbNorm(v.tipo) === 'suv'; }) : [];
            return {
                msg: 'Para uso familiar te recomiendo un <b>SUV</b>. ' + _sbKnow.tipos.suv.desc,
                resultados: resFam,
                fallback: 'En este momento no tenemos SUV disponibles, pero puedo avisarte cuando llegue uno. ¿Me dejas tu correo?'
            };
        }

        case 'trabajo': {
            var resTrab = inv ? INVENTARIO.filter(function(v){ return _sbNorm(v.tipo) === 'pickup'; }) : [];
            return {
                msg: 'Para trabajo y carga, una <b>pickup</b> es la mejor opción. ' + _sbKnow.tipos.pickup.desc,
                resultados: resTrab,
                fallback: 'No tenemos pickups en inventario justo ahora, pero puedo notificarte cuando haya una disponible. ¿Me dejas tu correo?'
            };
        }

        case 'ciudad': {
            var resCiu = inv ? INVENTARIO.filter(function(v){ return _sbNorm(v.tipo) === 'sedan' || _sbNorm(v.tipo) === 'camioneta'; }) : [];
            return {
                msg: 'Para uso en ciudad te conviene un <b>sedán</b> o <b>SUV compacto</b>. ' + _sbKnow.tipos.sedan.desc,
                resultados: resCiu,
                fallback: null
            };
        }

        case 'campo': {
            var resCam = inv ? INVENTARIO.filter(function(v){ return _sbNorm(v.tipo) === 'pickup'; }) : [];
            return {
                msg: 'Para terrenos difíciles y caminos de tierra, lo ideal es una <b>pickup 4x4</b> o un <b>SUV con tracción 4x4</b>. Ofrecen la potencia y altura necesaria para cualquier terreno.',
                resultados: resCam,
                fallback: null
            };
        }

        case 'financiamiento':
            return { msg: _sbKnow.financiamiento };

        case 'garantia':
            return { msg: _sbKnow.garantia };

        case 'contacto':
            return { msg: _sbKnow.contacto };

        case 'transmision': {
            var tAuto = t.indexOf('automatico') !== -1 || t.indexOf('automatica') !== -1;
            var tMan  = t.indexOf('manual') !== -1;
            if (tAuto && !tMan) return { msg: _sbKnow.transmision.automatica };
            if (tMan && !tAuto) return { msg: _sbKnow.transmision.manual };
            return { msg: '<b>¿Automático o manual?</b><br><br>' + _sbKnow.transmision.automatica + '<br><br>' + _sbKnow.transmision.manual };
        }

        case 'condicion':
            return { msg: _sbKnow.nuevo_vs_usado };

        case 'inventario': {
            var filtrosInv = _sbParsear(textoOriginal);
            var resInv, msgInv;
            if (inv && Object.keys(filtrosInv).length > 0) {
                resInv = _sbBuscar(textoOriginal);
                msgInv = 'Aquí tienes los vehículos que coinciden con tu búsqueda:';
            } else {
                resInv = inv ? INVENTARIO.slice(0, 6) : [];
                msgInv = 'Aquí tienes algunas opciones de nuestro inventario:';
            }
            return {
                msg: msgInv,
                resultados: resInv,
                fallback: 'El inventario no está disponible aquí. Puedes <a href="inventory.html" style="color:#FF8800">verlo completo aquí</a>.'
            };
        }

        case 'precio': {
            var resPrecio = inv ? _sbBuscar(textoOriginal) : [];
            if (resPrecio && resPrecio.length > 0) {
                return { msg: 'Aquí los precios de los vehículos que coinciden:', resultados: resPrecio };
            }
            return { msg: 'Para consultar precios específicos, puedes <a href="inventory.html" style="color:#FF8800">explorar el inventario completo</a> o contáctanos al <b>+502 3569-5967</b>.' };
        }

        case 'comparacion': {
            var marcasComp = [];
            ['toyota','honda','nissan','ford','chevrolet'].forEach(function(m){
                if (t.indexOf(m) !== -1) marcasComp.push(m);
            });
            if (marcasComp.length >= 2) {
                var respComp = marcasComp.map(function(m){
                    return '<b>' + m.charAt(0).toUpperCase() + m.slice(1) + ':</b> ' + _sbKnow.marcas[m];
                }).join('<br><br>');
                return { msg: respComp };
            }
            return { msg: '¿Cuáles dos vehículos o marcas quieres comparar? Por ejemplo: <i>"Toyota vs Honda"</i> o <i>"pickup vs SUV"</i>.' };
        }

        case 'info_marca': {
            var infoMarcas = [];
            ['toyota','honda','nissan','ford','chevrolet'].forEach(function(m){
                if (t.indexOf(m) !== -1) infoMarcas.push('<b>' + m.charAt(0).toUpperCase() + m.slice(1) + ':</b><br>' + _sbKnow.marcas[m]);
            });
            return { msg: infoMarcas.join('<br><br>') || 'Cuéntame más sobre qué marca te interesa y con gusto te ayudo.' };
        }
    }
    return null;
}

/* ---- Mensajes chat ---- */
function _sbMsgBot(html, delay) {
    delay = delay || 0;
    setTimeout(function() {
        var msgs = document.getElementById('sb-mensajes');
        if (!msgs) return;
        var div = document.createElement('div');
        div.className = 'sb-msg sb-msg--bot';
        div.innerHTML =
            '<div class="sb-avatar"><img src="images/logo-expedia.png" alt="Expedia Motors" /></div>' +
            '<div class="sb-burbuja">' + html + '</div>';
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }, delay);
}

function _sbMsgUser(texto) {
    var msgs = document.getElementById('sb-mensajes');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'sb-msg sb-msg--user';
    div.innerHTML = '<div class="sb-burbuja">' + _sbEsc(texto) + '</div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function _sbPensando() {
    var msgs = document.getElementById('sb-mensajes');
    if (!msgs) return;
    var div = document.createElement('div');
    div.className = 'sb-msg sb-msg--bot';
    div.id = 'sb-typing-msg';
    div.innerHTML =
        '<div class="sb-avatar"><img src="images/logo-expedia.png" alt="Expedia Motors" /></div>' +
        '<div class="sb-burbuja"><div class="sb-typing"><span></span><span></span><span></span></div></div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function _sbQuitarPensando() {
    var t = document.getElementById('sb-typing-msg');
    if (t) t.parentNode.removeChild(t);
}

/* ---- HTML resultados ---- */
function _sbHtmlResultados(lista) {
    var html = 'Encontré <b>' + lista.length + ' vehículo' + (lista.length !== 1 ? 's' : '') + '</b> que coinciden:';
    lista.slice(0, 3).forEach(function(v) {
        html +=
            '<a href="inventory-single.html?id=' + v.id + '" class="sb-resultado">' +
                '<img src="' + v.imagen + '" alt="' + _sbEsc(v.marca) + '" />' +
                '<div class="sb-resultado-info">' +
                    '<h5>' + _sbEsc(v.marca + ' ' + v.linea + ' ' + v.año) + '</h5>' +
                    '<span>' + _sbFmt(v.precio) + '</span>' +
                    '<p>' + _sbEsc(v.condicion) + ' &middot; ' + _sbEsc(v.transmision) + ' &middot; ' + _sbEsc(v.tipo) + '</p>' +
                '</div>' +
            '</a>';
    });
    if (lista.length > 3) {
        html += '<a href="inventory.html" style="font-size:11px;color:#FF8800;display:block;margin-top:10px;">Ver los ' + lista.length + ' resultados en el inventario &rarr;</a>';
    }
    return html;
}

/* ---- Formulario de email ---- */
function _sbHtmlFormEmail() {
    return '<div class="sb-form-email">' +
        '<textarea id="sb-desc" placeholder="Describe el vehículo que buscas: marca, tipo, año, presupuesto..."></textarea>' +
        '<input id="sb-email" type="email" placeholder="tucorreo@ejemplo.com" />' +
        '<button onclick="sbEnviarSolicitud()">Notificarme cuando haya disponible</button>' +
    '</div>';
}

function sbEnviarSolicitud() {
    var email = (document.getElementById('sb-email') || {}).value || '';
    if (!email || email.indexOf('@') === -1) {
        alert('Por favor ingresa un correo válido.');
        return;
    }
    _sbMsgBot('✅ ¡Listo! Hemos registrado tu solicitud.<br>Te escribiremos a <b>' + _sbEsc(email) + '</b> en cuanto tengamos un vehículo que se ajuste a lo que buscas.');
    var form = document.querySelector('.sb-form-email');
    if (form) { form.style.opacity = '0.4'; form.style.pointerEvents = 'none'; }
}

/* ---- Enviar mensaje ---- */
function sbEnviar() {
    var input = document.getElementById('sb-input');
    var texto = (input ? input.value : '').trim();
    if (!texto) return;
    input.value = '';
    input.focus();

    _sbMsgUser(texto);
    _sbPensando();

    setTimeout(function() {
        _sbQuitarPensando();

        var t = _sbNorm(texto);
        var intencion = _sbIntencion(t);
        var resp = intencion ? _sbRespuesta(intencion, t, texto) : null;

        if (resp) {
            _sbMsgBot(resp.msg);
            if (resp.resultados && resp.resultados.length > 0) {
                setTimeout(function() {
                    _sbMsgBot(_sbHtmlResultados(resp.resultados));
                    setTimeout(function() {
                        _sbMsgBot('¿Necesitas más información? También puedes <a href="inventory.html" style="color:#FF8800">ver el inventario completo</a>.');
                    }, 600);
                }, 500);
            } else if (resp.resultados && resp.resultados.length === 0 && resp.fallback) {
                setTimeout(function() {
                    _sbMsgBot(resp.fallback + _sbHtmlFormEmail());
                }, 500);
            }
            return;
        }

        /* Sin intención reconocida: búsqueda directa en inventario */
        if (typeof INVENTARIO === 'undefined') {
            _sbMsgBot('El inventario no está disponible aquí, pero puedes <a href="inventory.html" style="color:#FF8800">verlo completo</a> o <a href="contactus.html" style="color:#FF8800">contactarnos</a>.');
            return;
        }

        var resultados = _sbBuscar(texto);

        if (resultados && resultados.length > 0) {
            _sbMsgBot(_sbHtmlResultados(resultados));
            setTimeout(function() {
                _sbMsgBot('¿Necesitas más información sobre alguno? También puedes <a href="inventory.html" style="color:#FF8800">explorar el inventario completo</a>.');
            }, 700);
        } else {
            _sbMsgBot('No encontré vehículos con esas características en el inventario actual.');
            setTimeout(function() {
                _sbMsgBot('Pero puedo avisarte cuando tengamos algo disponible. Déjame tu correo y una descripción:' + _sbHtmlFormEmail());
            }, 700);
        }
    }, 950);
}

/* ---- Inicializar mensajes de bienvenida ---- */
function _sbIniciarChat() {
    var msgs = document.getElementById('sb-mensajes');
    if (!msgs || msgs.dataset.iniciado) return;
    msgs.dataset.iniciado = '1';
    _sbMsgBot('¡Hola! Soy el asistente de <b>Expedia Motors</b>. 👋');
    _sbMsgBot(
        'Puedo ayudarte a encontrar el vehículo ideal o resolver cualquier duda. Por ejemplo:<br>' +
        '<span style="color:rgba(255,255,255,0.45);font-style:italic">"Busco algo para mi familia"</span><br>' +
        '<span style="color:rgba(255,255,255,0.45);font-style:italic">"Toyota Hilux pickup usada"</span><br>' +
        '<span style="color:rgba(255,255,255,0.45);font-style:italic">"¿Diferencia entre automático y manual?"</span><br>' +
        '<span style="color:rgba(255,255,255,0.45);font-style:italic">"¿Tienen financiamiento?"</span>',
        500
    );
}

/* ---- Conectar con el toggle del search-box ---- */
document.addEventListener('DOMContentLoaded', function() {
    var panel = document.querySelector('.search-box');

    if (panel) {
        /* Mover al body garantiza que position:fixed funcione sin interferencias de padres */
        document.body.appendChild(panel);
        /* Ocultar via display para que no aparezca debajo del footer */
        panel.style.display = 'none';

        /* functions.js tiene $(".search-box span").on("click") que cierra el panel
           al hacer clic en CUALQUIER span interno. Se reemplaza con el selector correcto. */
        if (window.jQuery) {
            jQuery(panel).find('span').off('click');
            jQuery(panel).find('> span').on('click', function() {
                panel.style.display = 'none';
                jQuery(panel).removeClass('active');
                var input = document.getElementById('sb-input');
                if (input) input.value = '';
                _sbMostrarWa();
                _sbMostrarHeader();
            });
        }
    }

    var searchBtn = document.getElementById('search');
    if (searchBtn) {
        searchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!panel) return;
            panel.style.display = 'block';
            _sbOcultarWa();
            _sbOcultarHeader();
            setTimeout(_sbIniciarChat, 50);
        });
    }
});

function _sbOcultarWa() {
    var wa = document.getElementById('wa-btn');
    if (wa) wa.style.display = 'none';
}

function _sbMostrarWa() {
    var wa = document.getElementById('wa-btn');
    if (wa) wa.style.display = '';
}

function _sbOcultarHeader() {
    var nav = document.querySelector('.ow-navigation');
    if (nav) nav.style.visibility = 'hidden';
}

function _sbMostrarHeader() {
    var nav = document.querySelector('.ow-navigation');
    if (nav) nav.style.visibility = '';
}
