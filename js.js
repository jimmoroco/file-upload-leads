let horaInicio;
let matriz = [];
let errores = [];
const tioAux = ["TCRCLB", "TCRCLL", "TCRORL", "TCRPLL", "TCRPL1", "TCRMIN", "TCRINF", "AMXCLL", "AMXGLL", "AMXPLL", "AMXGRE"];
//const tioAux = ["TCRCLB", "TCRCLL", "TCRORL", "TCRPLL", "TCRPL1","TCRMIN","TCRINF","AMXCLL","AMXGLL","AMXPLL"];

// tabla
let titulos = [];
let cabeceras = [];
let anchos = [];
let mostrarError = false;

let textoCabeceras = "";

// var indiceOrden = 0;
let registrosPagina = 10; //20;
let indicePagina = 0;
let paginasBloque = 3; //5;
let indiceBloque = 0;
let terminoCargar = false;
// var intervalID;
// var cProgreso = 1;

window.onload = function () {
    configurarFileUpload();
    configurarBotones();
    //intervalID = window.setInterval(mostrarProgreso, 500);
}

function limpiarDatos() {
    document.getElementById("divPreview").innerHTML = "";
    document.getElementById("spnMensaje").innerHTML = ""; //"Registros: -</br>Duración: -";
}

// function mostrarProgreso()
// {
//     var spnProgreso = "Cargando " + ".".repeat(cProgreso);
//     document.getElementById("spnProgreso").innerHTML = spnProgreso;
//     cProgreso++;
// }

function configurarFileUpload() {
    let fupload = document.getElementById("fupload");
    fupload.onchange = function (e) {
        horaInicio = new Date();
        let file = e.target.files[0];
        limpiarDatos();
        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onloadend = function (e) {
            let data = reader.result;
            validarDatos(data);
            presentarTabla();
        }
        // reader.onprogress = function (){
        //     intervalID = window.setInterval(mostrarProgreso(), 500);
        // }
    }
}

function validarDatos(data) {
    let lista = data.split("\r\n");
    titulos = lista[0].split(",");
    cabeceras = lista[0].split(",");
    matriz = [];
    errores = [];
    let nRegistros = lista.length;
    let campos;
    let nCampos;
    let strError;
    let c = 0;
    for (let i = 1; i < nRegistros; i++) {
        strError = "";
        if (lista[i] != "") {
            campos = lista[i].split(",");
            nCampos = campos.length;
            if (nCampos != 5) {
                strError += "La fila debe tener 5 campos y no ";
                strError += nCampos.toString();
            }
            else {
                // ID: campos[0]
                if (campos[0] == null) strError += "ID no existe. ";
                else if (campos[0] == "") strError += "ID está vacío. ";
                else if (isNaN(campos[0])) strError += "ID debe ser un número entero. ";
                //CIC: campos[1]
                if (campos[1] == null) strError += "CIC no existe. ";
                else if (campos[1] == "") strError += "CIC está vacío. ";
                else {
                    switch (campos[1].length) {
                        case 8:
                            if (isNaN(campos[1])) {
                                strError += "CIC debe ser un número entero. 8 dígitos. ";
                                strError += campos[1];
                            }
                            break;
                        // case 12:
                        //     if (isNaN(campos[1].substring(4))) {
                        //         strError += "CIC debe ser un número entero. 12 dígitos. ";
                        //         strError += campos[1].substring(4);
                        //     }
                        //     break;
                        default:
                            strError += "CIC no tiene el formato correcto. ";
                            strError += campos[1];
                            break;
                    }
                }
                // MTOLINEASOL: campos[2]
                if (campos[2] == null) strError += "MTOLINEASOL no existe. ";
                else if (campos[2] == "") strError += "MTOLINEASOL está vacío. ";
                else if (isNaN(campos[2])) strError += "MTOLINEASOL debe ser un número entero. ";
                // CODPRODUCTO: campos[3]
                if (campos[3] == null) strError += "CODPRODUCTO no existe. ";
                else if (campos[3] == "") strError += "CODPRODUCTO está vacío.";
                else {
                    if (tioAux.findIndex(e => e == campos[3]) == -1) {
                        strError += "CODPRODUCTO ";
                        strError += campos[3];
                        strError += " no válido. ";
                    }
                }
                // PCT: campos[4]
                if (campos[4] == null) strError += "PCT no existe. ";
                else if (campos[4] == "") strError += "PCT está vacío. ";
                else {
                    if (campos[4].length != 3) {
                        strError += "PCT ";
                        strError += campos[3];
                        strError += "no válido. ";
                    }
                }
            }
            if (strError != "") {
                errores.push([campos[0], strError]);
            } else {
                matriz[c] = [];
                matriz[c][0] = campos[0] * 1;
                matriz[c][1] = campos[1];
                matriz[c][2] = campos[2] * 1;
                matriz[c][3] = campos[3];
                matriz[c][4] = campos[4];
                c++;
            }
        }
    }
}

function presentarTabla() {
    if (errores.length > 0) {
        presentarErrores();
    } else {
        presentarDatos();
    }
}

function presentarErrores() {
    cabeceras = ["ID", "Descripcion del error"];
    anchos = [50, 500];
    mostrarError = true;
    crearTabla();
    mostrarMatriz(errores, true);
}

function presentarDatos() {
    cabeceras = titulos;
    anchos = [100, 100, 100, 100, 100];
    mostrarError = false;
    crearTabla();
    mostrarMatriz(matriz, true);
}
// titulos = [];

function crearTabla() {
    var nCampos = cabeceras.length;
    textoCabeceras = cabeceras.join(',');
    var contenido = "<table border='1px'>";
    contenido += "<thead>";
    contenido += "<tr class='FilaCabecera'>";
    for (let j = 0; j < nCampos; j++) {
        contenido += "<th style='width:";
        contenido += anchos[j];
        contenido += "px' onclick=controlFiltro(this) data-id=";
        contenido += j;
        contenido += ">";
        contenido += cabeceras[j];
        contenido += "</th>";
    }
    contenido += "</tr>";
    contenido += "</thead>";
    contenido += "<tbody id='tbBusqueda'>";
    contenido += "</tbody>";
    contenido += "<tfoot>";
    contenido += "<tr><td id='tdPaginas' style='text-align:center' colspan='";
    contenido += nCampos.toString();
    contenido += "'></td></tr>";
    contenido += "</tfoot>";
    contenido += "</table>";
    document.getElementById("divPreview").innerHTML = contenido;
}

function mostrarMatriz(matriz, primeraVez) {
    let contenido = "";
    let n = matriz.length;
    let foo = 1;
    if (n > 0) {
        let nCampos = matriz[0].length;
        let inicio = indicePagina * registrosPagina;
        let fin = inicio + registrosPagina;
        for (let i = inicio; i < fin; i++) {
            if (i < n) {
                contenido += "<tr class='FilaDatos'>";
                for (let j = 0; j < nCampos; j++) {
                    contenido += "<td>";
                    contenido += matriz[i][j];
                    contenido += "</td>";
                }
                contenido += "</tr>";
            } else break;
        }
    } else {
        contenido += "<tr class='FilaSinDatos'>";
        contenido += "<td colspan='";
        contenido += cabeceras.length.toString();
        contenido += "'>";
        contenido += "No existen registros.";
        contenido += "</td>";
        contenido += "</tr>";
    }
    if (primeraVez) {
        var horaFin = new Date();
        var duracion = horaFin - horaInicio;
        document.getElementById("spnMensaje").innerHTML = "Registros: " + n.toString() + "</br>Duración: " + duracion + " msg";
    }
    document.getElementById("tbBusqueda").innerHTML = contenido;
    crearPaginas(matriz, indicePagina);
}

function crearPaginas(matriz, indicePintar) {
    let contenido = "";
    let n = matriz.length;
    if (n > 0) {
        if (indiceBloque > 0) {
            contenido += "<input type='button' class='Navega' onclick='paginar(-1);' value='<<'/>"; // falta el value
            contenido += "<input type='button' class='Navega' onclick='paginar(-2);' value='<'/>"; // falta el value
        }
        let indiceUltimaPagina = Math.floor(n / registrosPagina);
        if (n % registrosPagina == 0) indiceUltimaPagina--;
        let registrosBloque = registrosPagina * paginasBloque;
        let indiceUltimoBloque = Math.floor(n / registrosBloque);
        if (n % registrosBloque == 0) indiceUltimoBloque--;
        let inicio = indiceBloque * paginasBloque;
        let fin = inicio + paginasBloque;
        for (let i = inicio; i < fin; i++) {
            if (i <= indiceUltimaPagina) {
                if (i == indicePintar) {
                    contenido += "<input type='button' class='Navega NavegaFocus' onclick='paginar(";
                } else {
                    contenido += "<input type='button' class='Navega' onclick='paginar(";
                }
                contenido += i.toString();
                contenido += ");' value='";
                contenido += (i + 1).toString();
                contenido += "' />";
            }
        }
        if (indiceBloque < indiceUltimoBloque) {
            contenido += "<input type='button' class='Navega' onclick='paginar(-3);' value='>'/>"; // falta el value
            contenido += "<input type='button' class='Navega' onclick='paginar(-4);' value='>>'/>"; // falta el value
        }
    }
    document.getElementById("tdPaginas").innerHTML = contenido;
}

function paginar(indice) {
    if (indice > -1) {
        indicePagina = indice;
    } else {
        switch (indice) {
            case -1:
                indiceBloque = 0;
                indicePagina = 0;
                break;
            case -2:
                indiceBloque--;
                indicePagina = indiceBloque * paginasBloque;
                break;
            case -3:
                indiceBloque++;
                indicePagina = indiceBloque * paginasBloque;
                break;
            case -4:
                let n = (mostrarError ? errores.length : matriz.length);
                let registrosBloque = registrosPagina * paginasBloque;
                let indiceUltimoBloque = Math.floor(n / registrosBloque);
                if (n % registrosBloque == 0) indiceUltimoBloque--;
                indiceBloque = indiceUltimoBloque;
                indicePagina = indiceBloque * paginasBloque;
                break;
        }
    }
    mostrarMatriz(mostrarError ? errores : matriz, false);
}

function exportarTexto(link) {
    let texto = textoCabeceras;
    let n = matriz.length;
    if (n > 0) {
        for (let i = 0; i < n; i++) {
            texto += "\r\n";
            texto += matriz[i].join(",");
        }
    }
    let blob = new Blob([texto], { "type": "text/plain" });
    //var blob = new Blob(texto, { "type": "text/plain" });
    link.download = "Reporte.csv";
    link.href = URL.createObjectURL(blob);
}

function configurarBotones() {
    let btnGrabar = document.getElementById("btnGrabar");
    btnGrabar.onclick = function () {
        nEnvios = Math.floor(matriz.length / registrosEnviar);
        if (matriz.length % registrosEnviar > 0) nEnvios++;
        inicio = 0;
        horaInicio = new Date();
        let strDatos = prepararDatosEnviar();
        $.sendText("Cubso/grabarBulkCopy", mostrarGrabar, strDatos);
    }
    let btnVerErrores = document.getElementById("btnVerErrores");
    btnVerErrores.onclick = function () {
        presentarErrores();
    }
    let btnVerDatos = document.getElementById("btnVerDatos");
    btnVerDatos.onclick = function () {
        presentarDatos();
    }
    let btnExportarTexto = document.getElementById("aExportarTexto");
    btnExportarTexto.onclick = function () {
        exportarTexto(this);
    }
}

function controlFiltro(th) {
    if (!th.innerHTML.toString().includes('input')) {
        let thInnerHTML = "";
        thInnerHTML += "&nbsp;&nbsp;&nbsp;";
        thInnerHTML += "<input type='text' autofocus style='width:80px;height:11px' onkeyup=filtrarTabla(this,";
        thInnerHTML += th.dataset.id;
        thInnerHTML += ") />";
        th.innerHTML += thInnerHTML;
    }
}

function filtrarTabla(input, id) {
    ///if (input.value.toString().length == 8) {
        let n = matriz.length;
        let matrizFiltrada = [];
        //let nCampos = cabeceras.length;
        let c = 0;
        for (let i = 0; i < n; i++) {
            //for (let j = 0; j < nCampos; j++) {
            if (input.value == matriz[i][id] || input.value == "") {
                matrizFiltrada[c] = [];
                matrizFiltrada[c][0] = matriz[i][0];
                matrizFiltrada[c][1] = matriz[i][1];
                matrizFiltrada[c][2] = matriz[i][2];
                matrizFiltrada[c][3] = matriz[i][3];
                matrizFiltrada[c][4] = matriz[i][4];
                c++;
            }
            //}
        }
        //matriz = matrizFiltrada;
        mostrarMatriz(matrizFiltrada, false);
    //}
}