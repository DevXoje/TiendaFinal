abstract class EntityLocalData {
	nameFile = "";
	logicFile = "";
	form: HTMLFormElement;
	formElements: HTMLFormControlsCollection;
	table: HTMLTableElement;
	constructor(formId: string, galeryId: string) {
		this.form = document.querySelector(formId) as HTMLFormElement;
		this.formElements = this.form.elements as HTMLFormControlsCollection;
		this.table = document.querySelector(galeryId) as HTMLTableElement;
	}
	getData(): Array<any> {
		var output = new Array();
		var ajax = new XMLHttpRequest();
		ajax.overrideMimeType("application/json");
		ajax.open('GET', `./json/${this.nameFile}.json`, false);
		ajax.onreadystatechange = () => {
			if (ajax.readyState == 4 && ajax.status == 200) {
				output = JSON.parse(ajax.responseText);
			}
			if (ajax.status == 404) {
				console.log(`Error loadJSON file Not Found`);
			}
		};
		ajax.send(null);

		return output;
	}
	removeData(e: Event) {
		const btn_remove = e.target as HTMLButtonElement;
		const celda = btn_remove.parentElement as HTMLTableDataCellElement;
		const fila = celda.parentElement as HTMLTableRowElement;
		const idCelda = fila.querySelector("td") as HTMLTableDataCellElement;
		const id = idCelda.textContent as string;
		this.removeRow(fila)
		this.removeFromID(id);
	}
	removeRow(fila: HTMLTableRowElement) {
		fila.remove()
	}
	removeFromID(id: string) {
		var ajax = new XMLHttpRequest();
		const data: Array<any> = this.getData();
		const output = new Array();
		for (const dato of data) {
			if (dato.id != id) {
				output.push(dato);
			}
		}
		ajax.open("POST", `./php/${this.logicFile}.php?param=${JSON.stringify(output)}`, true);
		ajax.send();
	}
	editData(e: Event) {
		const btn_edit = e.target as HTMLButtonElement;
		const celda = btn_edit.parentElement as HTMLTableDataCellElement;
		const fila = celda.parentElement as HTMLTableRowElement;
		const idCelda = fila.querySelector("td") as HTMLTableDataCellElement;
		const data: Array<any> = this.getData();
		let toEdit;
		for (const dato of data) {
			if (dato.id == idCelda.textContent) {
				toEdit = dato;
			}
		}
		fila.classList.add("select");
		this.setData(toEdit);

	}
	configSetData() {
		this.form.addEventListener("submit", (e: Event) => {
			var ajax = new XMLHttpRequest();
			const newData = this.selectData();
			const dataTotal: Array<any> = this.getData();
			dataTotal.push(newData);
			ajax.open("POST", `./php/${this.logicFile}.php?param=${JSON.stringify(dataTotal)}`, true);
			ajax.send();
			this.addRow(newData);
			this.form.reset();
			e.preventDefault();
		});
	}
	setMaxID(data: Array<any>): number {
		let output: number = 0;
		for (let i = 0; i < data.length; i++) {
			const dato = data[i];
			if (dato.id > output) {
				output = dato.id;
			}
		}
		return output;
	}
	abstract printData(): any;
	abstract selectData(): any;
	abstract addRow(item: any): any;
	abstract setData(selected: any): any;
}

class Producto {
	static nextId = 0;
	id: number;
	stock: number;
	precio: number;
	familia: string;
	descripcion: string;

	constructor(descripcion: string, familia: string,
		precio: number,
		stock: number) {
		this.id = ++Producto.nextId;
		this.descripcion = descripcion;
		this.familia = familia;
		this.precio = precio;
		this.stock = stock;
	}
	saveId(producto: Producto) {

	}
}
class ProductoList extends EntityLocalData {


	constructor() {
		super(".productosForm", ".table");
		this.nameFile = "productos";
		this.logicFile = "producto";
	}
	selectData() {
		const formData = new FormData(this.form);
		const productoBruto = {
			txt_descripcion: formData.get('txt_descripcion') as string,
			select_familia: formData.get('select_familia') as string,
			num_precio: Number(formData.get('num_precio') as string),
			num_stock: Number(formData.get('num_stock') as string)
		};
		const producto = new Producto(
			productoBruto.txt_descripcion,
			productoBruto.select_familia,
			productoBruto.num_precio,
			productoBruto.num_stock
		);
		if (this.form.classList.contains("select")) {
			const filaSelect = this.table.querySelector(".select") as HTMLTableRowElement;
			const idCelda = filaSelect.querySelector("td") as HTMLTableDataCellElement;
			const id = idCelda.textContent as string;
			producto.id = parseInt(id);
			Producto.nextId = this.setMaxID(this.getData());;
			this.removeFromID(id);
			this.form.classList.remove("select");
			filaSelect.classList.remove("select");
		}
		return producto;
	}
	setData(selected: any) {
		this.form.classList.add("select");
		const descriptionContainer = this.formElements.item(0) as HTMLInputElement;
		const familiaContainer = this.formElements.item(1) as HTMLInputElement;
		const precioContainer = this.formElements.item(2) as HTMLInputElement;
		const stockContainer = this.formElements.item(3) as HTMLInputElement;
		descriptionContainer.value = selected.descripcion;
		familiaContainer.value = selected.familia;
		precioContainer.value = selected.precio;
		stockContainer.value = selected.stock;
	}
	printData() {
		const data: Array<Producto> = this.getData();
		Producto.nextId = this.setMaxID(data);
		for (const producto of data) {
			this.addRow(producto)
		}
	}
	addRow(producto: any) {
		let newRow;
		const controls = {
			btn_edit: document.createElement("button"),
			btn_remove: document.createElement("button")
		}
		controls.btn_edit.type = "button";
		controls.btn_edit.className = "btn btn-warning";
		controls.btn_edit.textContent = "Edit";
		controls.btn_remove.type = "button";
		controls.btn_remove.className = "btn btn-danger";
		controls.btn_remove.textContent = "Del";

		controls.btn_edit.id = "btn_edit_" + producto.id;
		controls.btn_remove.id = "btn_remove_" + producto.id;
		const bodyTable = this.table.querySelector("tbody") as HTMLElement;
		newRow = `
		<tr>
			<td scope="row">${producto.id}</td>
                <td>${producto.precio}</td>
                <td>${producto.stock}</td>
                <td>${producto.familia}</td>
                <td>${producto.descripcion}</td>
				<td>${controls.btn_edit.outerHTML}</td>
				<td>${controls.btn_remove.outerHTML}</td>
		</tr>`;
		bodyTable.innerHTML += newRow;
		const btn_edit = document.getElementById("btn_edit_" + producto.id) as HTMLButtonElement;
		const btn_remove = document.getElementById("btn_remove_" + producto.id) as HTMLButtonElement;
		btn_edit.addEventListener("click", (e) => this.editData(e));
		btn_remove.addEventListener("click", (e) => this.removeData(e));

	}
}
class ClienteList extends EntityLocalData {
	addRow(item: any) {
		throw new Error("Method not implemented.");
	}
	setData(selected: any) {
		throw new Error("Method not implemented.");
	}
	editData() {
		throw new Error("Method not implemented.");
	}
	removeData() {
		throw new Error("Method not implemented.");
	}
	selectData() {
		const formData = new FormData(this.form);
		const clienteBruto = {
			txt_descripcion: formData.get('txt_descripcion') as string,
			select: formData.get('select') as string,
			num_precio: formData.get('num_precio') as string,
			num_stock: formData.get('num_stock') as string
		}
		return clienteBruto;
	}
	printData() {
	}
	constructor() {
		super(".clientesForm", "");
		this.nameFile = "clientes";
		this.logicFile = "cliente";
	}
}
class VentaList extends EntityLocalData {
	addRow(item: any) {
		throw new Error("Method not implemented.");
	}
	setData(selected: any) {
		throw new Error("Method not implemented.");
	}
	editData() {
		throw new Error("Method not implemented.");
	}
	removeData() {
		throw new Error("Method not implemented.");
	}
	selectData() {
		const formData = new FormData(this.form);
		const ventaBruto = {
			txt_descripcion: formData.get('txt_descripcion') as string,
			select: formData.get('select') as string,
			num_precio: formData.get('num_precio') as string,
			num_stock: formData.get('num_stock') as string
		}
		return ventaBruto;
	}
	printData() { }
	constructor() {
		super(".ventaForm", "");
		this.nameFile = "ventas";
		this.logicFile = "venta";
	}
}