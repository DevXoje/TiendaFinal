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
    function EntityLocalData(formId, galeryId) {
        this.nameFile = "";
        this.logicFile = "";
        this.form = document.querySelector(formId);
        this.formElements = this.form.elements;
        this.table = document.querySelector(galeryId);
    }
    EntityLocalData.prototype.getData = function () {
        var output = new Array();
        var ajax = new XMLHttpRequest();
        ajax.overrideMimeType("application/json");
        ajax.open('GET', "./json/" + this.nameFile + ".json", false);
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
        this.removeRow(fila);
        this.removeFromID(id);
    };
    EntityLocalData.prototype.removeRow = function (fila) {
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
        ajax.open("POST", "./php/" + this.logicFile + ".php?param=" + JSON.stringify(output), true);
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
            if (dato.id == idCelda.textContent) {
                toEdit = dato;
            }
        }
        fila.classList.add("select");
        this.setData(toEdit);
    };
    EntityLocalData.prototype.configSetData = function () {
        var _this = this;
        this.form.addEventListener("submit", function (e) {
            var ajax = new XMLHttpRequest();
            var newData = _this.selectData();
            var dataTotal = _this.getData();
            dataTotal.push(newData);
            ajax.open("POST", "./php/" + _this.logicFile + ".php?param=" + JSON.stringify(dataTotal), true);
            ajax.send();
            _this.addRow(newData);
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
    Producto.prototype.saveId = function (producto) {
    };
    Producto.nextId = 0;
    return Producto;
}());
var ProductoList = /** @class */ (function (_super) {
    __extends(ProductoList, _super);
    function ProductoList() {
        var _this = _super.call(this, ".productosForm", ".table") || this;
        _this.nameFile = "productos";
        _this.logicFile = "producto";
        return _this;
    }
    ProductoList.prototype.selectData = function () {
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
    ProductoList.prototype.setData = function (selected) {
        this.form.classList.add("select");
        var descriptionContainer = this.formElements.item(0);
        var familiaContainer = this.formElements.item(1);
        var precioContainer = this.formElements.item(2);
        var stockContainer = this.formElements.item(3);
        descriptionContainer.value = selected.descripcion;
        familiaContainer.value = selected.familia;
        precioContainer.value = selected.precio;
        stockContainer.value = selected.stock;
    };
    ProductoList.prototype.printData = function () {
        var data = this.getData();
        Producto.nextId = this.setMaxID(data);
        for (var _i = 0, data_3 = data; _i < data_3.length; _i++) {
            var producto = data_3[_i];
            this.addRow(producto);
        }
    };
    ProductoList.prototype.addRow = function (producto) {
        var _this = this;
        var newRow;
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
        var _this = _super.call(this, ".clientesForm", "") || this;
        _this.nameFile = "clientes";
        _this.logicFile = "cliente";
        return _this;
    }
    ClienteList.prototype.addRow = function (item) {
        throw new Error("Method not implemented.");
    };
    ClienteList.prototype.setData = function (selected) {
        throw new Error("Method not implemented.");
    };
    ClienteList.prototype.editData = function () {
        throw new Error("Method not implemented.");
    };
    ClienteList.prototype.removeData = function () {
        throw new Error("Method not implemented.");
    };
    ClienteList.prototype.selectData = function () {
        var formData = new FormData(this.form);
        var clienteBruto = {
            txt_descripcion: formData.get('txt_descripcion'),
            select: formData.get('select'),
            num_precio: formData.get('num_precio'),
            num_stock: formData.get('num_stock')
        };
        return clienteBruto;
    };
    ClienteList.prototype.printData = function () {
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
    VentaList.prototype.addRow = function (item) {
        throw new Error("Method not implemented.");
    };
    VentaList.prototype.setData = function (selected) {
        throw new Error("Method not implemented.");
    };
    VentaList.prototype.editData = function () {
        throw new Error("Method not implemented.");
    };
    VentaList.prototype.removeData = function () {
        throw new Error("Method not implemented.");
    };
    VentaList.prototype.selectData = function () {
        var formData = new FormData(this.form);
        var ventaBruto = {
            txt_descripcion: formData.get('txt_descripcion'),
            select: formData.get('select'),
            num_precio: formData.get('num_precio'),
            num_stock: formData.get('num_stock')
        };
        return ventaBruto;
    };
    VentaList.prototype.printData = function () { };
    return VentaList;
}(EntityLocalData));
