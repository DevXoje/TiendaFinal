abstract class EntityLocalData {
	nameFile = "";
	logicFile = "";
	form: HTMLFormElement;
	formElements: Array<HTMLInputElement>;
	table: HTMLTableElement;
	constructor(nameFile: string, logicFile: string) {
		this.form = document.querySelector(".form") as HTMLFormElement;
		this.formElements = new Array<HTMLInputElement>();
		for (let i = 0; i < this.form.elements.length; i++) {
			const element = this.form.elements.item(i) as HTMLInputElement;
			if (!element.classList.contains("btn")) {
				this.formElements.push(element);
			}
		}
		this.table = document.querySelector(".table") as HTMLTableElement;
		this.nameFile = nameFile;
		this.logicFile = logicFile;
	}
	getData(): Array<any> {
		var output = new Array();
		var ajax = new XMLHttpRequest();
		ajax.overrideMimeType("application/json");
		ajax.open('GET', `../json/${this.nameFile}.json`, false);
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
		this.removeFromID(id);
		fila.remove();

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
		ajax.open("POST", `../php/${this.logicFile}.php?param=${JSON.stringify(output)}`, true);
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
			(dato.id == idCelda.textContent) ? toEdit = dato : null;
		}
		fila.classList.add("select");
		this.setDataOnForm(toEdit);

	}
	configSubmit() {
		this.form.addEventListener("submit", (e: Event) => {
			var ajax = new XMLHttpRequest();
			const newData = this.selectDataOfTable();
			const dataTotal: Array<any> = this.getData();
			dataTotal.push(newData);
			ajax.open("POST", `../php/${this.logicFile}.php?param=${JSON.stringify(dataTotal)}`, true);
			ajax.send();
			this.addRowOnTable(newData);
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
	getButtons(): {
		btn_edit: HTMLButtonElement;
		btn_remove: HTMLButtonElement;
	} {
		const controls = {
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
	}

	abstract printDataOnTable(): any;
	abstract selectDataOfTable(): any;
	abstract addRowOnTable(item: any): any;//Posible abstraccion a clase padre
	abstract setDataOnForm(selected: any): any;
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
}
class Cliente {
	static nextId = 0;
	id: number;
	nombre: string;
	apellidos: string;
	dni: string;
	fecha_nac: string;
	email: string;
	password: string;
	constructor(nombre: string,
		apellidos: string,
		dni: string,
		fecha_nac: string,
		email: string,
		password: string,) {
		this.id = ++Producto.nextId;
		this.nombre = nombre;
		this.apellidos = apellidos;
		this.dni = dni;
		this.fecha_nac = fecha_nac;
		this.email = email;
		this.password = password;
	}
}
class ProductoList extends EntityLocalData {
	constructor() {
		super("productos", "producto");
	}
	selectDataOfTable() {
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
	setDataOnForm(selected: any) {
		this.form.classList.add("select");

		this.formElements[0].value = selected.descripcion;
		this.formElements[1].value = selected.familia;
		this.formElements[2].value = selected.precio;
		this.formElements[3].value = selected.stock;
	}
	printDataOnTable() {
		const data: Array<Producto> = this.getData();
		Producto.nextId = this.setMaxID(data);
		for (const producto of data) {
			this.addRowOnTable(producto)
		}
	}
	addRowOnTable(producto: any) {
		let newRow;
		const controls = this.getButtons();

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

	constructor() {
		super("clientes", "cliente");
	}
	selectDataOfTable() {
		const formData = new FormData(this.form);
		const clienteBruto = {
			txt_nombre: formData.get('txt_nombre') as string,
			txt_apellidos: formData.get('txt_apellidos') as string,
			txt_dni: formData.get('txt_dni') as string,
			date_nac: formData.get('date_nac') as string,
			email_contact: formData.get('email_contact') as string,
			pass_password: formData.get('pass_password') as string
		}
		const cliente = new Cliente(
			clienteBruto.txt_nombre,
			clienteBruto.txt_apellidos,
			clienteBruto.txt_dni,
			clienteBruto.date_nac,
			clienteBruto.email_contact,
			clienteBruto.pass_password,
		);
		if (this.form.classList.contains("select")) {
			const filaSelect = this.table.querySelector(".select") as HTMLTableRowElement;
			const idCelda = filaSelect.querySelector("td") as HTMLTableDataCellElement;
			const id = idCelda.textContent as string;
			cliente.id = parseInt(id);
			Cliente.nextId = this.setMaxID(this.getData());
			this.removeFromID(id);//Fallo aqui no borra
			this.form.classList.remove("select");
			filaSelect.classList.remove("select");
		}
		return cliente;
	}
	setDataOnForm(selected: any) {
		this.form.classList.add("select");

		this.formElements[0].value = selected.nombre;
		this.formElements[1].value = selected.apellidos;
		this.formElements[2].value = selected.dni;
		this.formElements[3].value = selected.date_nac;
		this.formElements[4].value = selected.email;
		this.formElements[5].value = selected.password;
	}
	printDataOnTable() {
		const data: Array<Cliente> = this.getData();
		Cliente.nextId = this.setMaxID(data);
		for (const cliente of data) {
			this.addRowOnTable(cliente);
		}
	}
	addRowOnTable(cliente: any) {
		let newRow;
		const controls = this.getButtons();

		controls.btn_edit.id = "btn_edit_" + cliente.id;
		controls.btn_remove.id = "btn_remove_" + cliente.id;
		const bodyTable = this.table.querySelector("tbody") as HTMLElement;
		newRow = `
		<tr>
			<td scope="row">${cliente.id}</td>
                <td>${cliente.precio}</td>
                <td>${cliente.stock}</td>
                <td>${cliente.familia}</td>
                <td>${cliente.descripcion}</td>
				<td>${controls.btn_edit.outerHTML}</td>
				<td>${controls.btn_remove.outerHTML}</td>
		</tr>`;
		bodyTable.innerHTML += newRow;
		const btn_edit = document.getElementById("btn_edit_" + cliente.id) as HTMLButtonElement;
		const btn_remove = document.getElementById("btn_remove_" + cliente.id) as HTMLButtonElement;
		btn_edit.addEventListener("click", (e) => this.editData(e));
		btn_remove.addEventListener("click", (e) => this.removeData(e));

	}

}
class VentaList extends EntityLocalData {
	addRowOnTable(item: any) {
		throw new Error("Method not implemented.");
	}
	setDataOnForm(selected: any) {
		throw new Error("Method not implemented.");
	}

	removeData() {
		throw new Error("Method not implemented.");
	}
	selectDataOfTable() {
		const formData = new FormData(this.form);
		const ventaBruto = {
			txt_descripcion: formData.get('txt_descripcion') as string,
			select: formData.get('select') as string,
			num_precio: formData.get('num_precio') as string,
			num_stock: formData.get('num_stock') as string
		}
		return ventaBruto;
	}
	printDataOnTable() { }
	constructor() {
		super(".ventaForm", "");
		this.nameFile = "ventas";
		this.logicFile = "venta";
	}
}