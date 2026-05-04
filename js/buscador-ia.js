/* Buscador IA — Expedia Motors */

function _norm(s) {
    return String(s).toLowerCase()
        .replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i')
        .replace(/ó/g,'o').replace(/ú/g,'u').replace(/ñ/g,'n');
}

var _biaAbierto = false;

function biaToggle() {
    _biaAbierto = !_biaAbierto;
    var panel   = document.getElementById('bia-panel');
    var btnText = document.querySelector('#bia-toggle .bia-btn-text');
    var btnIcon = document.querySelector('#bia-toggle .bia-btn-icon i');
    panel.classList.toggle('bia-open', _biaAbierto);
    if (_biaAbierto) {
        if (btnIcon)  btnIcon.className  = 'fa fa-times';
        if (btnText)  btnText.style.display = 'none';
    } else {
        if (btnIcon)  btnIcon.className  = 'fa fa-comments';
        if (btnText)  btnText.style.display = '';
    }
}

function _biaMsgBot(html, delay) {
    delay = delay || 0;
    setTimeout(function() {
        var msgs = document.getElementById('bia-mensajes');
        var div  = document.createElement('div');
        div.className = 'bia-msg bia-msg--bot';
        div.innerHTML =
            '<div class="bia-avatar"><i class="fa fa-car"></i></div>' +
            '<div class="bia-burbuja">' + html + '</div>';
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    }, delay);
}

function _biaMsgUser(texto) {
    var msgs = document.getElementById('bia-mensajes');
    var div  = document.createElement('div');
    div.className = 'bia-msg bia-msg--user';
    div.innerHTML  = '<div class="bia-burbuja">' + _esc(texto) + '</div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function _biaPensando() {
    var msgs = document.getElementById('bia-mensajes');
    var div  = document.createElement('div');
    div.className = 'bia-msg bia-msg--bot';
    div.id        = 'bia-typing-msg';
    div.innerHTML =
        '<div class="bia-avatar"><i class="fa fa-car"></i></div>' +
        '<div class="bia-burbuja"><div class="bia-typing"><span></span><span></span><span></span></div></div>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function _biaQuitarPensando() {
    var t = document.getElementById('bia-typing-msg');
    if (t) t.parentNode.removeChild(t);
}

function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _fmtQ(n) {
    return 'Q ' + Number(n).toLocaleString('es-GT');
}

function _parsear(texto) {
    var t = _norm(texto);
    var f = {};

    /* Marcas */
    ['toyota','honda','nissan','ford','chevrolet'].forEach(function(m) {
        if (t.indexOf(m) !== -1) f.marca = m;
    });

    /* Tipos */
    var tipos = {
        'suv':'suv', 'pickup':'pickup', 'pick up':'pickup',
        'camioneta':'camioneta', 'sedan':'sedan', 'sedán':'sedan',
        'coupe':'coupe', 'cupé':'coupe'
    };
    Object.keys(tipos).forEach(function(k) {
        if (t.indexOf(k) !== -1) f.tipo = tipos[k];
    });

    /* Transmisión */
    if (t.indexOf('automatico') !== -1 || t.indexOf('automatica') !== -1) f.transmision = 'automatico';
    if (t.indexOf('manual') !== -1) f.transmision = 'manual';

    /* Condición */
    if (t.indexOf('nuevo') !== -1 || t.indexOf('nueva') !== -1) f.condicion = 'nuevo';
    if (t.indexOf('usado') !== -1 || t.indexOf('usada') !== -1) f.condicion = 'usado';

    return f;
}

function _buscar(texto) {
    if (typeof INVENTARIO === 'undefined') return null;

    var filtros = _parsear(texto);

    if (Object.keys(filtros).length === 0) {
        var t = _norm(texto);
        return INVENTARIO.filter(function(v) {
            return _norm(v.marca).indexOf(t)   !== -1 ||
                   _norm(v.linea).indexOf(t)   !== -1 ||
                   _norm(v.tipo).indexOf(t)    !== -1 ||
                   _norm(v.version).indexOf(t) !== -1;
        });
    }

    return INVENTARIO.filter(function(v) {
        return (!filtros.marca       || _norm(v.marca)       === filtros.marca)       &&
               (!filtros.tipo        || _norm(v.tipo)        === filtros.tipo)        &&
               (!filtros.transmision || _norm(v.transmision) === filtros.transmision) &&
               (!filtros.condicion   || _norm(v.condicion)   === filtros.condicion);
    });
}

function _htmlResultados(lista) {
    var html = 'Encontré <b>' + lista.length + ' vehículo' + (lista.length !== 1 ? 's' : '') + '</b> que coinciden:';
    lista.slice(0, 3).forEach(function(v) {
        html +=
            '<a href="inventory-single.html?id=' + v.id + '" class="bia-resultado">' +
                '<img src="' + v.imagen + '" alt="' + _esc(v.marca) + '" />' +
                '<div class="bia-resultado-info">' +
                    '<h5>' + _esc(v.marca + ' ' + v.linea + ' ' + v.año) + '</h5>' +
                    '<span>' + _fmtQ(v.precio) + '</span>' +
                    '<p>' + _esc(v.condicion) + ' &middot; ' + _esc(v.transmision) + ' &middot; ' + _esc(v.tipo) + '</p>' +
                '</div>' +
            '</a>';
    });
    if (lista.length > 3) {
        html += '<a href="inventory.html" style="font-size:11px;color:#FF8800;display:block;margin-top:10px;">Ver los ' + lista.length + ' resultados en el inventario &rarr;</a>';
    }
    return html;
}

function _htmlFormEmail() {
    return '<div class="bia-form-email">' +
        '<textarea id="bia-desc" placeholder="Describe el vehículo que buscas: marca, tipo, año, presupuesto..."></textarea>' +
        '<input id="bia-email" type="email" placeholder="tucorreo@ejemplo.com" />' +
        '<button onclick="biaEnviarSolicitud()">Notificarme cuando haya disponible</button>' +
    '</div>';
}

function biaEnviarSolicitud() {
    var email = (document.getElementById('bia-email') || {}).value || '';
    if (!email || email.indexOf('@') === -1) {
        alert('Por favor ingresa un correo válido.');
        return;
    }
    /* Aquí iría la llamada al backend para guardar la solicitud */
    _biaMsgBot('✅ ¡Listo! Hemos registrado tu solicitud.<br>Te escribiremos a <b>' + _esc(email) + '</b> en cuanto tengamos un vehículo que se ajuste a lo que buscas.');

    /* Deshabilitar el formulario enviado */
    var form = document.querySelector('.bia-form-email');
    if (form) { form.style.opacity = '0.4'; form.style.pointerEvents = 'none'; }
}

function biaEnviar() {
    var input = document.getElementById('bia-input');
    var texto = (input.value || '').trim();
    if (!texto) return;
    input.value = '';
    input.focus();

    _biaMsgUser(texto);
    _biaPensando();

    setTimeout(function() {
        _biaQuitarPensando();

        if (typeof INVENTARIO === 'undefined') {
            _biaMsgBot('El inventario no está disponible aquí, pero puedes <a href="inventory.html" style="color:#FF8800">verlo completo</a> o <a href="contactus.html" style="color:#FF8800">contactarnos</a>.');
            return;
        }

        var resultados = _buscar(texto);

        if (resultados && resultados.length > 0) {
            _biaMsgBot(_htmlResultados(resultados));
            setTimeout(function() {
                _biaMsgBot('¿Necesitas más información sobre alguno? También puedes <a href="inventory.html" style="color:#FF8800">explorar el inventario completo</a>.');
            }, 700);
        } else {
            _biaMsgBot('No encontré vehículos con esas características en el inventario actual.');
            setTimeout(function() {
                _biaMsgBot('Pero puedo avisarte cuando tengamos algo disponible. Cuéntame un poco más y déjame tu correo:' + _htmlFormEmail());
            }, 700);
        }
    }, 950);
}

/* Inicializar mensajes de bienvenida al cargar */
document.addEventListener('DOMContentLoaded', function() {
    _biaMsgBot('¡Hola! Soy el asistente de <b>Expedia Motors</b>. 👋');
    _biaMsgBot(
        'Dime qué vehículo estás buscando y te ayudo a encontrarlo. Puedes escribir algo como:<br>' +
        '<span style="color:rgba(255,255,255,0.45);font-style:italic">"SUV Toyota automática nueva"</span><br>' +
        '<span style="color:rgba(255,255,255,0.45);font-style:italic">"pickup 4x4 usada"</span><br>' +
        '<span style="color:rgba(255,255,255,0.45);font-style:italic">"Honda CR-V 2024"</span>',
        500
    );
});
