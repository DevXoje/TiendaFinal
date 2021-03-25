"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * Controla la logica comun de los 3 apartados, la conexion con el archivo fisico(almacenar), conexion con formulario(Crear-Editar) y con una tabla(Ver)
 */
var EntityLocalData = /** @class */ (function () {
    /**
     * Se establecen las conexiones de los contenedores HTML
     * @param nameFile nombre del archivo con informacion
     * @param logicFile nombre del archivo con la logica de conexion
     */
    function EntityLocalData(nameFile, logicFile) {
        this.form = document.querySelector(".form");
        this.formElements = new Array();
        for (var i = 0; i < this.form.elements.length; i++) {
            var element = this.form.elements.item(i);
            if (!element.classList.contains("btn")) {
                this.formElements.push(element);
            }
        }
        this.table = document.querySelector(".table");
        this.nameFile = nameFile;
        this.logicFile = logicFile;
    }
    /**
     * Conecta con el archico fisico de forma sincrona
     * @returns Array con la informacion en formato JSON
     */
    EntityLocalData.prototype.getData = function () {
        var output = new Array();
        var ajax = new XMLHttpRequest();
        ajax.overrideMimeType("application/json");
        ajax.open('GET', "./../../json/" + this.nameFile + ".json", false);
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                output = JSON.parse(ajax.responseText);
            }
            if (ajax.status == 404) {
                console.log("Error loadJSON file Not Found");
            }
        };
        ajax.send(null);
        return output;
    };
    /**
     * Evento que cambiara el valor del variable isBorrrado el registro de tabla
     * @param e  Evento del botton borrar
     */
    EntityLocalData.prototype.removeData = function (e) {
        var btn_remove = e.target;
        var celda = btn_remove.parentElement;
        var fila = celda.parentElement;
        var idCelda = fila.querySelector("td");
        var id = idCelda.textContent;
        this.removeFromID(id);
        fila.remove();
    };
    /**
     * Conecta con el archico fisico de forma asincrona, mediante la id cambia el valor de isBorrado del registro
     * @param id string que identifica a los registros
     */
    EntityLocalData.prototype.removeFromID = function (id) {
        var ajax = new XMLHttpRequest();
        var data = this.getData();
        var output = new Array();
        data.forEach(function (dato) {
            dato.isBorrado = dato.id == id;
            output.push(dato);
        });
        ajax.open("POST", "./../../php/" + this.logicFile + ".php?param=" + JSON.stringify(output), true);
        ajax.send();
    };
    /**
     * Evento que editara el registro de tabla
     * @param e Evento del botton editar
     */
    EntityLocalData.prototype.editData = function (e) {
        var btn_edit = e.target;
        var celda = btn_edit.parentElement;
        var fila = celda.parentElement;
        var idCelda = fila.querySelector("td");
        var data = this.getData();
        var toEdit;
        data.forEach(function (dato) { return (dato.id == idCelda.textContent) ? toEdit = dato : null; });
        fila.classList.add("select");
        this.setDataOnForm(toEdit);
        this.configBtnOnEdit(celda);
    };
    /**
     * Quita todos los botones de la tabla y deja un boton para cancelar el modo edicion
     * @param celdaBtn Celda donde esta el botton editar y donde estara el de cancelar
     */
    EntityLocalData.prototype.configBtnOnEdit = function (celdaBtn) {
        var _this = this;
        var btns = this.table.querySelectorAll("button");
        var btn_cancelEdit = document.createElement("button");
        btn_cancelEdit.type = "button";
        btn_cancelEdit.className = "btn btn-danger";
        btn_cancelEdit.onclick = function () { return _this.endEdit(); };
        btn_cancelEdit.textContent = "CANCELAR";
        btns.forEach(function (btn) { return btn.style.display = "none"; });
        celdaBtn.appendChild(btn_cancelEdit);
    };
    /**
     * Restaura los botones ocultados y elimina el boton de cancelar
     */
    EntityLocalData.prototype.endEdit = function () {
        this.form.reset();
        var elements = document.querySelectorAll(".select");
        var btns = this.table.querySelectorAll("button");
        elements.forEach(function (element) { return element.classList.remove("select"); });
        btns.forEach(function (btn) { return (btn.style.display == "none") ? btn.style.display = "inline-block" : btn.remove(); });
    };
    EntityLocalData.prototype.checkInEdit = function () {
        if (this.form.classList.contains("select")) {
            var filaSelect = this.table.querySelector(".select");
            var idCelda = filaSelect.querySelector("td");
            var id_1 = idCelda.textContent;
            var ajax = new XMLHttpRequest();
            var data = this.getData();
            var output_1 = new Array();
            data.forEach(function (dato) {
                if (dato.id != id_1)
                    output_1.push(dato);
            });
            ajax.open("POST", "./../../php/" + this.logicFile + ".php?param=" + JSON.stringify(output_1), true);
            ajax.send();
            this.form.classList.remove("select");
            filaSelect.classList.remove("select");
            this.endEdit();
        }
    };
    /**
     * Prepara la logica para captura los datos del formulario y añadirlos al documento fisico
     */
    EntityLocalData.prototype.configSubmit = function () {
        var _this = this;
        this.form.addEventListener("submit", function (e) {
            var ajax = new XMLHttpRequest();
            var dataTotal = _this.getData();
            _this.checkInEdit();
            var newData = _this.selectDataOfTable();
            dataTotal.push(newData);
            ajax.open("POST", "./../../php/" + _this.logicFile + ".php?param=" + JSON.stringify(dataTotal), true);
            ajax.send();
            _this.form.reset();
            e.preventDefault();
        });
    };
    EntityLocalData.prototype.setMaxID = function (data) {
        var output = 0;
        for (var i = 0; i < data.length; i++) {
            var dato = data[i];
            if (dato.id > output) {
                output = dato.id;
            }
        }
        return output;
    };
    EntityLocalData.prototype.getButtons = function () {
        var controls = {
            btn_edit: document.createElement("button"),
            btn_remove: document.createElement("button")
        };
        controls.btn_edit.type = "button";
        controls.btn_edit.className = "btn btn-warning";
        controls.btn_edit.textContent = "Edit";
        controls.btn_remove.type = "button";
        controls.btn_remove.className = "btn btn-danger";
        controls.btn_remove.textContent = "Del";
        return controls;
    };
    EntityLocalData.prototype.printDataOnTable = function () {
        var _this = this;
        var data = this.getData();
        data.forEach(function (dato) {
            if (!dato.isBorrado) {
                _this.addRowOnTable(dato);
            }
        });
    };
    ;
    return EntityLocalData;
}());
var Producto = /** @class */ (function () {
    function Producto(descripcion, familia, precio, stock, isBorrado) {
        if (isBorrado === void 0) { isBorrado = false; }
        this.id = ++Producto.nextId;
        this.descripcion = descripcion;
        this.familia = familia;
        this.precio = precio;
        this.stock = stock;
        this.isBorrado = isBorrado;
    }
    Producto.nextId = 0;
    return Producto;
}());
var ProductoVendido = /** @class */ (function (_super) {
    __extends(ProductoVendido, _super);
    function ProductoVendido(producto, cantidad) {
        var _this = _super.call(this, producto.descripcion, producto.familia, producto.precio, producto.stock) || this;
        _this.id = producto.id;
        _this.cantidad = cantidad;
        return _this;
    }
    return ProductoVendido;
}(Producto));
var Cliente = /** @class */ (function () {
    function Cliente(nombre, apellidos, dni, fecha_nac, email, password, isBorrado) {
        if (isBorrado === void 0) { isBorrado = false; }
        this.id = ++Producto.nextId;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.dni = dni;
        this.fecha_nac = fecha_nac;
        this.email = email;
        this.password = password;
        this.isBorrado = isBorrado;
    }
    Cliente.nextId = 0;
    return Cliente;
}());
var Venta = /** @class */ (function () {
    function Venta(cliente, isBorrado) {
        this.id = ++Venta.nextId;
        this.cliente = cliente;
        this.productos = new Array();
        this.isBorrado = isBorrado;
    }
    Venta.prototype.addProducto = function (newProducto, cantidad) {
        this.productos.push(new ProductoVendido(newProducto, cantidad));
    };
    Venta.nextId = 0;
    return Venta;
}());
var ProductoList = /** @class */ (function (_super) {
    __extends(ProductoList, _super);
    function ProductoList() {
        return _super.call(this, "productos", "producto") || this;
    }
    ProductoList.prototype.getData = function () {
        var data = _super.prototype.getData.call(this);
        Producto.nextId = this.setMaxID(data);
        return data;
    };
    ProductoList.prototype.selectDataOfTable = function () {
        var formData = new FormData(this.form);
        Producto.nextId = this.setMaxID(this.getData());
        var productoBruto = {
            txt_descripcion: formData.get('txt_descripcion'),
            select_familia: formData.get('select_familia'),
            num_precio: Number(formData.get('num_precio')),
            num_stock: Number(formData.get('num_stock'))
        };
        var producto = new Producto(productoBruto.txt_descripcion, productoBruto.select_familia, productoBruto.num_precio, productoBruto.num_stock);
        console.log(producto);
        if (this.form.classList.contains("select")) {
            var filaSelect = this.table.querySelector(".select");
            var idCelda = filaSelect.querySelector("td");
            var id = idCelda.textContent;
            producto.id = parseInt(id);
            Producto.nextId = this.setMaxID(this.getData());
            this.removeFromID(id);
            this.form.classList.remove("select");
            filaSelect.classList.remove("select");
            this.endEdit();
        }
        return producto;
    };
    ProductoList.prototype.setDataOnForm = function (selected) {
        this.form.classList.add("select");
        this.formElements[0].value = selected.descripcion;
        this.formElements[1].value = selected.familia;
        this.formElements[2].value = selected.precio;
        this.formElements[3].value = selected.stock;
    };
    ProductoList.prototype.addRowOnTable = function (producto) {
        var _this = this;
        var newRow;
        var controls = this.getButtons();
        controls.btn_edit.id = "btn_edit_" + producto.id;
        controls.btn_remove.id = "btn_remove_" + producto.id;
        var bodyTable = this.table.querySelector("tbody");
        newRow = "\n\t\t<tr>\n\t\t\t<td scope=\"row\">" + producto.id + "</td>\n                <td>" + producto.precio + "\u20AC</td>\n                <td>" + producto.stock + "</td>\n                <td>" + producto.familia + "</td>\n                <td>" + producto.descripcion + "</td>\n\t\t\t\t<td>" + controls.btn_edit.outerHTML + "</td>\n\t\t\t\t<td>" + controls.btn_remove.outerHTML + "</td>\n\t\t</tr>";
        bodyTable.innerHTML += newRow;
        var btn_edit = document.getElementById("btn_edit_" + producto.id);
        var btn_remove = document.getElementById("btn_remove_" + producto.id);
        btn_edit.addEventListener("click", function (e) { return _this.editData(e); });
        btn_remove.addEventListener("click", function (e) { return _this.removeData(e); });
    };
    return ProductoList;
}(EntityLocalData));
var ClienteList = /** @class */ (function (_super) {
    __extends(ClienteList, _super);
    function ClienteList() {
        return _super.call(this, "clientes", "cliente") || this;
    }
    ClienteList.prototype.getData = function () {
        var data = _super.prototype.getData.call(this);
        Cliente.nextId = this.setMaxID(data);
        return data;
    };
    ClienteList.prototype.selectDataOfTable = function () {
        var formData = new FormData(this.form);
        Cliente.nextId = this.setMaxID(this.getData());
        var clienteBruto = {
            txt_nombre: formData.get('txt_nombre'),
            txt_apellidos: formData.get('txt_apellidos'),
            txt_dni: formData.get('txt_dni'),
            date_nac: formData.get('date_nac'),
            email_contact: formData.get('email_contact'),
            pass_password: formData.get('pass_password')
        };
        var cliente = new Cliente(clienteBruto.txt_nombre, clienteBruto.txt_apellidos, clienteBruto.txt_dni, clienteBruto.date_nac, clienteBruto.email_contact, clienteBruto.pass_password);
        if (this.form.classList.contains("select")) {
            var filaSelect = this.table.querySelector(".select");
            var idCelda = filaSelect.querySelector("td");
            var id = idCelda.textContent;
            cliente.id = parseInt(id);
            Cliente.nextId = this.setMaxID(this.getData());
            this.removeFromID(id); //Fallo aqui no borra
            this.form.classList.remove("select");
            filaSelect.classList.remove("select");
        }
        return cliente;
    };
    ClienteList.prototype.setDataOnForm = function (selected) {
        this.form.classList.add("select");
        this.formElements[0].value = selected.nombre;
        this.formElements[1].value = selected.apellidos;
        this.formElements[2].value = selected.dni;
        this.formElements[3].value = selected.fecha_nac;
        this.formElements[4].value = selected.email;
        this.formElements[5].value = selected.password;
    };
    ClienteList.prototype.addRowOnTable = function (cliente) {
        var _this = this;
        var newRow;
        var controls = this.getButtons();
        controls.btn_edit.id = "btn_edit_" + cliente.id;
        controls.btn_remove.id = "btn_remove_" + cliente.id;
        var bodyTable = this.table.querySelector("tbody");
        newRow = "\n\t\t<tr>\n\t\t\t<td scope=\"row\">" + cliente.id + "</td>\n                <td>" + cliente.nombre + "</td>\n                <td>" + cliente.apellidos + "</td>\n                <td>" + cliente.dni + "</td>\n                <td>" + cliente.fecha_nac + "</td>\n                <td>" + cliente.email + "</td>\n                <td>" + cliente.password + "</td>\n\t\t\t\t<td>" + controls.btn_edit.outerHTML + "</td>\n\t\t\t\t<td>" + controls.btn_remove.outerHTML + "</td>\n\t\t</tr>";
        bodyTable.innerHTML += newRow;
        var btn_edit = document.getElementById("btn_edit_" + cliente.id);
        var btn_remove = document.getElementById("btn_remove_" + cliente.id);
        btn_edit.addEventListener("click", function (e) { return _this.editData(e); });
        btn_remove.addEventListener("click", function (e) { return _this.removeData(e); });
    };
    ClienteList.prototype.setConfigEyePassword = function () {
        var toggler = document.querySelector(".toggle-password");
        var eye = document.querySelector(".toggler");
        var passwordContainer = document.querySelector("#pass_password");
        toggler.onclick = function (event) {
            event.preventDefault();
            //eye.classList.toggle("fa-eye fa-eye-slash");
            if (passwordContainer.type == "password") {
                passwordContainer.type = "text";
                eye.classList.replace("fa-eye-slash", "fa-eye");
            }
            else {
                passwordContainer.type = "password";
                eye.classList.replace("fa-eye", "fa-eye-slash");
            }
        };
    };
    return ClienteList;
}(EntityLocalData));
var VentaList = /** @class */ (function (_super) {
    __extends(VentaList, _super);
    function VentaList() {
        var _this = _super.call(this, "ventas", "venta") || this;
        _this.configEmpezar();
        return _this;
    }
    VentaList.prototype.selectDataOfTable = function () {
        var formData = new FormData(this.form);
        var ventaBruto = {
            select_cliente: formData.get('select_cliente'),
            select_productos: formData.get('select_productos'),
            num_cantidad: parseInt(formData.get('num_cantidad'))
        };
    };
    VentaList.prototype.setDataOnForm = function (selected) {
        throw new Error("Method not implemented.");
    };
    VentaList.prototype.addRowOnTable = function (venta) {
        var _this = this;
        var newRow;
        var bodyTable = this.table.querySelector("tbody");
        var controls = this.getButtons();
        var selectOutputProductos = document.createElement("select");
        var costaTotal = 0;
        selectOutputProductos.className = "form-select";
        for (var i = 0; i < venta.productos.length; i++) {
            var newOption = document.createElement("option");
            var producto = venta.productos[i];
            costaTotal += (producto.precio) * producto.cantidad;
            newOption.innerHTML = producto.id + ".- " + producto.familia + " - " + producto.precio + "\u20AC X " + producto.cantidad;
            newOption.value = producto.id.toString();
            selectOutputProductos.appendChild(newOption);
        }
        controls.btn_edit.id = "btn_edit_" + venta.id;
        controls.btn_remove.id = "btn_remove_" + venta.id;
        newRow = "\n\t\t<tr>\n\t\t\t<td scope=\"row\">" + venta.id + "</td>\n\t\t\t\t<td>" + venta.cliente.id + ".- " + venta.cliente.nombre + " - " + venta.cliente.dni + "</td>\n\t\t\t\t<td>" + selectOutputProductos.outerHTML + "</td>\n\t\t\t\t<td>" + costaTotal + "</td>\n\t\t\t\t<td>" + controls.btn_edit.outerHTML + "</td>\n\t\t\t\t<td>" + controls.btn_remove.outerHTML + "</td>\n\t\t</tr>";
        bodyTable.innerHTML += newRow;
        var btn_edit = document.getElementById("btn_edit_" + venta.id);
        var btn_remove = document.getElementById("btn_remove_" + venta.id);
        btn_edit.addEventListener("click", function (e) { return _this.editData(e); });
        btn_remove.addEventListener("click", function (e) { return _this.removeData(e); });
    };
    //Self methods
    VentaList.prototype.configEmpezar = function () {
        var _this = this;
        var btn_empezar = document.getElementById("btn_empezar");
        btn_empezar.onclick = function () {
            var formGroupClient = _this.form.querySelector(".d-none");
            btn_empezar.style.display = "none";
            _this.form.classList.remove("d-none");
            formGroupClient.classList.remove("d-none");
            _this.loadClients();
        };
    };
    VentaList.prototype.loadClients = function () {
        var _this = this;
        var data = new ClienteList().getData();
        var inputCliente = document.getElementById("select_cliente");
        for (var i = 0; i < data.length; i++) {
            var newOption = document.createElement("option");
            var cliente = data[i];
            newOption.innerHTML = cliente.id + ".- " + cliente.nombre + " - " + cliente.dni;
            newOption.value = cliente.id.toString();
            inputCliente.appendChild(newOption);
        }
        inputCliente.onchange = function () {
            var hidenElements = _this.form.querySelectorAll(".d-none");
            var productoDiv = hidenElements.item(0);
            var cantidadDiv = hidenElements.item(1);
            var totalDiv = hidenElements.item(2);
            var inputProducto = document.getElementById("select_productos");
            if (inputCliente.value != "none") {
                productoDiv.classList.remove("d-none");
                _this.loadProductos();
                inputProducto.onchange = function () {
                    if (inputProducto.value != "none") {
                        cantidadDiv.classList.remove("d-none");
                        totalDiv.classList.remove("d-none");
                        _this.configAddProduct();
                    }
                    else {
                        cantidadDiv.classList.add("d-none");
                        totalDiv.classList.add("d-none");
                    }
                };
            }
            else {
                productoDiv.classList.add("d-none");
            }
        };
    };
    VentaList.prototype.loadProductos = function () {
        var data = new ProductoList().getData();
        var inputCliente = document.getElementById("select_productos");
        for (var i = 0; i < data.length; i++) {
            var newOption = document.createElement("option");
            var producto = data[i];
            newOption.innerHTML = producto.id + ".- " + producto.familia + " - " + producto.precio + "\u20AC";
            newOption.value = producto.id.toString();
            inputCliente.appendChild(newOption);
        }
    };
    VentaList.prototype.configAddProduct = function () {
        var btn_addProduct = document.getElementById("btn_addProduct");
        var cantidadInput = document.getElementById("num_cantidad");
        var productoInput = document.getElementById("select_productos");
        var productosData = new ProductoList().getData();
        var outputProducto = document.querySelector(".product-wrapper");
        var cantidadProducto = document.querySelector(".quantity-wrapper");
        var divOutputProducto = document.createElement("div");
        var divOutputCantidad = document.createElement("div");
        btn_addProduct.onclick = function () {
            productosData.forEach(function (productoData) {
                if (productoData.id == parseInt(productoInput.value)) {
                    divOutputProducto.innerHTML = productoData.id + " " + productoData.familia + " " + productoData.precio;
                    divOutputCantidad.innerHTML = "" + cantidadInput.value;
                    outputProducto.appendChild(divOutputProducto);
                    cantidadProducto.appendChild(divOutputCantidad);
                }
            });
            console.log(cantidadInput.value);
        };
    };
    return VentaList;
}(EntityLocalData));
