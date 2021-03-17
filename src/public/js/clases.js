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
var EntityLocalData = /** @class */ (function () {
    function EntityLocalData(nameFile, logicFile) {
        this.nameFile = "";
        this.logicFile = "";
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
    EntityLocalData.prototype.removeData = function (e) {
        var btn_remove = e.target;
        var celda = btn_remove.parentElement;
        var fila = celda.parentElement;
        var idCelda = fila.querySelector("td");
        var id = idCelda.textContent;
        this.removeFromID(id);
        fila.remove();
    };
    EntityLocalData.prototype.removeFromID = function (id) {
        var ajax = new XMLHttpRequest();
        var data = this.getData();
        var output = new Array();
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var dato = data_1[_i];
            if (dato.id != id) {
                output.push(dato);
            }
        }
        ajax.open("POST", "../php/" + this.logicFile + ".php?param=" + JSON.stringify(output), true);
        ajax.send();
    };
    EntityLocalData.prototype.editData = function (e) {
        var btn_edit = e.target;
        var celda = btn_edit.parentElement;
        var fila = celda.parentElement;
        var idCelda = fila.querySelector("td");
        var data = this.getData();
        var toEdit;
        for (var _i = 0, data_2 = data; _i < data_2.length; _i++) {
            var dato = data_2[_i];
            (dato.id == idCelda.textContent) ? toEdit = dato : null;
        }
        fila.classList.add("select");
        this.setDataOnForm(toEdit);
    };
    EntityLocalData.prototype.configSubmit = function () {
        var _this = this;
        this.form.addEventListener("submit", function (e) {
            var ajax = new XMLHttpRequest();
            var newData = _this.selectDataOfTable();
            var dataTotal = _this.getData();
            dataTotal.push(newData);
            ajax.open("POST", "../php/" + _this.logicFile + ".php?param=" + JSON.stringify(dataTotal), true);
            ajax.send();
            _this.addRowOnTable(newData);
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
    return EntityLocalData;
}());
var Producto = /** @class */ (function () {
    function Producto(descripcion, familia, precio, stock) {
        this.id = ++Producto.nextId;
        this.descripcion = descripcion;
        this.familia = familia;
        this.precio = precio;
        this.stock = stock;
    }
    Producto.nextId = 0;
    return Producto;
}());
var Cliente = /** @class */ (function () {
    function Cliente(nombre, apellidos, dni, fecha_nac, email, password) {
        this.id = ++Producto.nextId;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.dni = dni;
        this.fecha_nac = fecha_nac;
        this.email = email;
        this.password = password;
    }
    Cliente.nextId = 0;
    return Cliente;
}());
var ProductoList = /** @class */ (function (_super) {
    __extends(ProductoList, _super);
    function ProductoList() {
        return _super.call(this, "productos", "producto") || this;
    }
    ProductoList.prototype.selectDataOfTable = function () {
        var formData = new FormData(this.form);
        var productoBruto = {
            txt_descripcion: formData.get('txt_descripcion'),
            select_familia: formData.get('select_familia'),
            num_precio: Number(formData.get('num_precio')),
            num_stock: Number(formData.get('num_stock'))
        };
        var producto = new Producto(productoBruto.txt_descripcion, productoBruto.select_familia, productoBruto.num_precio, productoBruto.num_stock);
        if (this.form.classList.contains("select")) {
            var filaSelect = this.table.querySelector(".select");
            var idCelda = filaSelect.querySelector("td");
            var id = idCelda.textContent;
            producto.id = parseInt(id);
            Producto.nextId = this.setMaxID(this.getData());
            ;
            this.removeFromID(id);
            this.form.classList.remove("select");
            filaSelect.classList.remove("select");
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
    ProductoList.prototype.printDataOnTable = function () {
        var data = this.getData();
        Producto.nextId = this.setMaxID(data);
        for (var _i = 0, data_3 = data; _i < data_3.length; _i++) {
            var producto = data_3[_i];
            this.addRowOnTable(producto);
        }
    };
    ProductoList.prototype.addRowOnTable = function (producto) {
        var _this = this;
        var newRow;
        var controls = this.getButtons();
        controls.btn_edit.id = "btn_edit_" + producto.id;
        controls.btn_remove.id = "btn_remove_" + producto.id;
        var bodyTable = this.table.querySelector("tbody");
        newRow = "\n\t\t<tr>\n\t\t\t<td scope=\"row\">" + producto.id + "</td>\n                <td>" + producto.precio + "</td>\n                <td>" + producto.stock + "</td>\n                <td>" + producto.familia + "</td>\n                <td>" + producto.descripcion + "</td>\n\t\t\t\t<td>" + controls.btn_edit.outerHTML + "</td>\n\t\t\t\t<td>" + controls.btn_remove.outerHTML + "</td>\n\t\t</tr>";
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
        var _this = _super.call(this, "clientes", "cliente") || this;
        _this.setConfigEyePassword();
        return _this;
    }
    ClienteList.prototype.selectDataOfTable = function () {
        var formData = new FormData(this.form);
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
        this.formElements[3].value = selected.date_nac;
        this.formElements[4].value = selected.email;
        this.formElements[5].value = selected.password;
    };
    ClienteList.prototype.printDataOnTable = function () {
        var data = this.getData();
        Cliente.nextId = this.setMaxID(data);
        for (var _i = 0, data_4 = data; _i < data_4.length; _i++) {
            var cliente = data_4[_i];
            this.addRowOnTable(cliente);
        }
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
        /*$(document).ready(function() {
    $("#show_hide_password a").on('click', function(event) {
        event.preventDefault();
        if($('#show_hide_password input').attr("type") == "text"){
            $('#show_hide_password input').attr('type', 'password');
            $('#show_hide_password i').addClass( "fa-eye-slash" );
            $('#show_hide_password i').removeClass( "fa-eye" );
        }else if($('#show_hide_password input').attr("type") == "password"){
            $('#show_hide_password input').attr('type', 'text');
            $('#show_hide_password i').removeClass( "fa-eye-slash" );
            $('#show_hide_password i').addClass( "fa-eye" );
        }
    });
});*/
    };
    return ClienteList;
}(EntityLocalData));
var VentaList = /** @class */ (function (_super) {
    __extends(VentaList, _super);
    function VentaList() {
        var _this = _super.call(this, ".ventaForm", "") || this;
        _this.nameFile = "ventas";
        _this.logicFile = "venta";
        return _this;
    }
    VentaList.prototype.addRowOnTable = function (item) {
        throw new Error("Method not implemented.");
    };
    VentaList.prototype.setDataOnForm = function (selected) {
        throw new Error("Method not implemented.");
    };
    VentaList.prototype.removeData = function () {
        throw new Error("Method not implemented.");
    };
    VentaList.prototype.selectDataOfTable = function () {
        var formData = new FormData(this.form);
        var ventaBruto = {
            txt_descripcion: formData.get('txt_descripcion'),
            select: formData.get('select'),
            num_precio: formData.get('num_precio'),
            num_stock: formData.get('num_stock')
        };
        return ventaBruto;
    };
    VentaList.prototype.printDataOnTable = function () { };
    return VentaList;
}(EntityLocalData));
