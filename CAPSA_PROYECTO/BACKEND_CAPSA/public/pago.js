document.addEventListener('DOMContentLoaded', function() {
    // =============================================
    // ELEMENTOS DEL DOM
    // =============================================
    const formulario = document.getElementById('formularioPago');
    const btnValidar = document.getElementById('validar');
    const btnCancelarForm = document.getElementById('cancelarForm');
    const btnCancelarSalir = document.getElementById('cancelarSalir');
    const servicioSelect = document.getElementById('servicio');
    const montoInput = document.getElementById('monto');
    const resultadoDiv = document.getElementById('resultado');
    const descargarComprobante = document.getElementById('descargarComprobante');

    // Variable para almacenar el PDF generado
    let pdfGenerado = null;

    // =============================================
    // PRECIOS DE LOS SERVICIOS
    // =============================================
    const preciosServicios = {
        'por sesión (2 horas)': 300.00, // Servicios Básicos
        'por sesión (2 horas)': 500.00, // Servicios Intermedios
        'por sesión (2 horas)': 800.00, // Servicios Avanzados
        'por día': 500.00, // Cuidados Básicos
        'por día': 800.00, // Cuidados Intermedios
        'por día': 1000.00 // Cuidados Avanzados
    };

    // =============================================
    // FUNCIONES DE VALIDACIÓN
    // =============================================
    function validarRFC(rfc) {
        if (!rfc) return true; // No es requerido
        const regex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
        return regex.test(rfc);
    }

    function validarCURP(curp) {
        const regex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/;
        return regex.test(curp);
    }

    function validarCodigoPostal(cp) {
        const regex = /^\d{5}$/;
        return regex.test(cp);
    }

    function validarTelefono(tel) {
        const regex = /^\d{10}$/;
        return regex.test(tel);
    }

    // =============================================
    // VERIFICACIÓN DEL FORMULARIO
    // =============================================
    function verificarFormulario() {
        // Obtener todos los inputs requeridos
        const inputsRequeridos = Array.from(formulario.querySelectorAll('input[required], select[required]'));

        // Verificar que todos los campos requeridos tengan valor
        const todosLlenos = inputsRequeridos.every(input => {
            return input.value.trim() !== '';
        });

        // Validaciones específicas
        const rfc = document.getElementById('rfc').value;
        const curp = document.getElementById('curp').value;
        const codigoPostal = document.getElementById('codigoPostal').value;
        const telefono = document.getElementById('telefono').value;
        const servicio = document.getElementById('servicio').value;

        const validacionesEspeciales = (
            validarRFC(rfc) &&
            validarCURP(curp) &&
            validarCodigoPostal(codigoPostal) &&
            validarTelefono(telefono) &&
            servicio !== "" // El servicio debe estar seleccionado
        );

        // Habilitar o deshabilitar el botón
        btnValidar.disabled = !(todosLlenos && validacionesEspeciales);
    }

    // =============================================
    // EVENT LISTENERS
    // =============================================
    formulario.addEventListener('input', function() {
        verificarFormulario();
    });

    servicioSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const precioText = selectedOption.text.split(' - ')[1]; // Obtiene "$300.00"
        const precio = parseFloat(precioText.replace('$', ''));
        montoInput.value = precio;
        verificarFormulario();
    });

    btnCancelarForm.addEventListener('click', function() {
        formulario.reset();
        btnValidar.disabled = true;
        resultadoDiv.style.display = 'none';
        pdfGenerado = null;
    });

    btnCancelarSalir.addEventListener('click', function() {
        window.history.back();
    });

    document.getElementById('rfc').addEventListener('blur', function() {
        if (this.value && !validarRFC(this.value)) {
            alert('Por favor ingrese un RFC válido (ej. ABC123456XYZ)');
            this.focus();
        }
        verificarFormulario();
    });

    document.getElementById('curp').addEventListener('blur', function() {
        if (!validarCURP(this.value)) {
            alert('Por favor ingrese una CURP válida (ej. ABCD123456HDFGHJ01)');
            this.focus();
        }
        verificarFormulario();
    });

    document.getElementById('codigoPostal').addEventListener('blur', function() {
        if (!validarCodigoPostal(this.value)) {
            alert('Por favor ingrese un código postal válido (5 dígitos)');
            this.focus();
        }
        verificarFormulario();
    });

    document.getElementById('telefono').addEventListener('blur', function() {
        if (!validarTelefono(this.value)) {
            alert('Por favor ingrese un número de teléfono válido (10 dígitos)');
            this.focus();
        }
        verificarFormulario();
    });

    // =============================================
    // FUNCIONES AUXILIARES
    // =============================================
    function generarNumeroAleatorio(longitud) {
        let resultado = '';
        for (let i = 0; i < longitud; i++) {
            resultado += Math.floor(Math.random() * 10);
        }
        return resultado;
    }

    // =============================================
    // GENERACIÓN DE PDF
    // =============================================
    function generarPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Recopilar datos del formulario
        const formData = new FormData(formulario);
        const datos = {};
        for (let [key, value] of formData.entries()) {
            datos[key] = value;
        }

        // Configuración inicial
        const fechaActual = new Date();
        const fechaLimitePago = new Date();
        fechaLimitePago.setDate(fechaLimitePago.getDate() + 15);
        const lineaCaptura = generarNumeroAleatorio(27);
        const clabeInterbancaria = '0211805503000' + generarNumeroAleatorio(4);

        // =============================================
        // ENCABEZADO DEL PDF
        // =============================================
        doc.setFontSize(16);
        doc.text("PLATAFORMA WEB CAPSA", 105, 15, { align: 'center' });
        doc.text("SERVICIOS AUXILIARES", 105, 22, { align: 'center' });
        doc.setFontSize(12);
        doc.text("LÍNEA DE CAPTURA PARA PAGO EN VENTANILLA", 105, 29, { align: 'center' });

        // =============================================
        // LÍNEA DE CAPTURA
        // =============================================
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text(lineaCaptura.match(/.{1,6}/g).join(' '), 105, 40, { align: 'center' });
        doc.setFontSize(10);
        doc.text("POR FAVOR CAPTURE SIN ESPACIOS", 105, 45, { align: 'center' });

        // =============================================
        // DATOS GENERALES
        // =============================================
        doc.setFontSize(12);
        doc.text(`Fecha de emisión: ${fechaActual.toLocaleDateString()}`, 20, 55);
        doc.text(`Fecha límite de pago: ${fechaLimitePago.toLocaleDateString()}`, 20, 60);
        doc.text(`Total a pagar: $${parseFloat(datos.monto).toFixed(2)}`, 160, 60);

        // =============================================
        // DATOS DEL CONTRIBUYENTE
        // =============================================
        doc.setFontSize(14);
        doc.text("DATOS DEL CONTRIBUYENTE", 20, 70);
        doc.setFontSize(10);
        doc.text(`Nombre: ${datos.nombre} ${datos.apellido_paterno} ${datos.apellido_materno}`, 20, 77);
        doc.text(`CURP: ${datos.curp}`, 20, 82);
        if (datos.rfc) doc.text(`RFC: ${datos.rfc}`, 20, 87);
        doc.text(`Teléfono: ${datos.telefono}`, 20, 92);
        doc.text(`Domicilio: ${datos.calle} ${datos.numero_exterior} ${datos.numero_interior ? 'Int. ' + datos.numero_interior : ''}`, 20, 97);
        doc.text(`${datos.colonia}, ${datos.municipio}, ${datos.estado}, C.P. ${datos.codigo_postal}`, 20, 102);

        // =============================================
        // TABLA DE CONTRIBUCIÓN
        // =============================================
        doc.setFontSize(14);
        doc.text("DATOS DE LA CONTRIBUCIÓN", 20, 112);
        doc.autoTable({
            startY: 117,
            head: [
                ['CLAVE', 'DESCRIPCIÓN', 'CANTIDAD', 'TARIFA O TASA', 'SUBTOTAL']
            ],
            body: [
                [generarNumeroAleatorio(6), datos.servicio, '1', `$${parseFloat(datos.monto).toFixed(2)}`, `$${parseFloat(datos.monto).toFixed(2)}`]
            ],
            theme: 'grid'
        });

        // =============================================
        // INSTITUCIONES AUTORIZADAS (EN COLUMNAS) - AJUSTADO MÁS A LA IZQUIERDA
        // =============================================
        const startY = doc.autoTable.previous.finalY + 15;

        doc.setFontSize(12);
        doc.text("PAGO EN VENTANILLA CON LAS SIGUIENTES INSTITUCIONES AUTORIZADAS", 105, startY, { align: 'center' });

        const bancos = [
            "AFIRME TRN0846",
            "BANCO AZTECA",
            "BANCO DEL BAJÍO 1009",
            "BANORTE-IXE 131017",
            "BBVA CIE1336150",
            "CHEDRAUI",
            "CITIBANAMEX PA: 4122/01",
            "COMERCIAL CITY FRESKO",
            "FINANCIERA PARA EL BIENESTAR",
            "HSBC RAP 7131",
            "SANTANDER 0009619",
            "SCOTIABANK 3793",
            "SORIANA",
            "FARM, GUADALAJARA/",
            "INTERCAM BANCO/ SUPER KOMPRAS"
        ];

        // Dividir en 3 columnas con posición más a la izquierda
        const columnWidth = 55; // Reducido para mover todo a la izquierda
        const column1X = 15; // Más a la izquierda (antes era 20)
        const column2X = column1X + columnWidth;
        const column3X = column2X + columnWidth;

        let yPosition = startY + 10;

        bancos.forEach((banco, index) => {
            const column = index % 3;
            const xPosition = column === 0 ? column1X : (column === 1 ? column2X : column3X);

            doc.text(banco, xPosition, yPosition);

            if (column === 2) {
                yPosition += 7;
            }
        });

        // Ajustar posición Y para la siguiente sección
        yPosition += 10;

        // =============================================
        // TRANSFERENCIA INTERBANCARIA
        // =============================================
        doc.setFontSize(12);
        doc.text("TRANSFERENCIA INTERBANCARIA", 20, yPosition);
        doc.setFontSize(10);
        doc.text(`Banco Destino: HSBC`, 20, yPosition + 7);
        doc.text(`Nombre del Beneficiario: Gobierno del Estado de México`, 20, yPosition + 14);
        doc.text(`CLABE: ${clabeInterbancaria}`, 20, yPosition + 21);
        doc.text(`Concepto: Colocar línea de captura a 27 dígitos sin espacios`, 20, yPosition + 28);

        // =============================================
        // PIE DE PÁGINA
        // =============================================
        doc.setFontSize(8);
        doc.text("ESTE DOCUMENTO NO ES EL COMPROBANTE DE PAGO, SÓLO ES VÁLIDO CON LA CERTIFICACIÓN O COMPROBANTE", 105, 280, { align: 'center' });
        doc.text("DE PAGO EMITIDO POR LA INSTITUCIÓN DE CRÉDITO O ESTABLECIMIENTOS MERCANTILES AUTORIZADOS.", 105, 284, { align: 'center' });

        return doc;
    }

    // =============================================
    // MANEJO DEL ENVÍO DEL FORMULARIO
    // =============================================
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();

        // Generar el PDF y guardarlo en la variable
        pdfGenerado = generarPDF();

        // Mostrar la sección de resultado
        resultadoDiv.style.display = 'block';
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    });

    // =============================================
    // DESCARGAR COMPROBANTE
    // =============================================
    descargarComprobante.addEventListener('click', function() {
        if (pdfGenerado) {
            pdfGenerado.save(`PAGO_${document.getElementById('nombre').value.toUpperCase()}.pdf`);
        } else {
            alert('Primero debe generar el comprobante');
        }
    });

    // =============================================
    // INICIALIZACIÓN
    // =============================================
    verificarFormulario();
});