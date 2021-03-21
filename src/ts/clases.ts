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
		ajax.open('GET', `./../../json/${this.nameFile}.json`, false);
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
		ajax.open("POST", `./../../php/${this.logicFile}.php?param=${JSON.stringify(output)}`, true);
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
		this.configBtnOnEdit(celda);

	}
	configBtnOnEdit(celdaBtn: HTMLTableDataCellElement) {
		const btns = this.table.querySelectorAll("button");
		const btn_cancelEdit = document.createElement("button");
		btn_cancelEdit.type = "button";
		btn_cancelEdit.className = "btn btn-danger";
		btn_cancelEdit.addEventListener("click", this.cancelEdit);
		btn_cancelEdit.textContent = "CANCELAR"
		btns.forEach((btn) => {
			btn.style.display = "none";
		});
		celdaBtn.appendChild(btn_cancelEdit);

	}
	cancelEdit() {
		this.form.reset();
		const elements = document.querySelectorAll(".select");
		elements.forEach((element) => {
			element.classList.remove("select");
		})
	}
	configSubmit() {
		this.form.addEventListener("submit", (e: Event) => {
			var ajax = new XMLHttpRequest();
			const dataTotal: Array<any> = this.getData();
			const newData = this.selectDataOfTable();

			dataTotal.push(newData);
			ajax.open("POST", `./../../php/${this.logicFile}.php?param=${JSON.stringify(dataTotal)}`, true);
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
	getData(): Array<Producto> {
		const data = super.getData();
		Producto.nextId = this.setMaxID(data);
		return data
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
	getData(): Array<Cliente> {
		const data = super.getData();
		Cliente.nextId = this.setMaxID(data);
		return data
	}
	selectDataOfTable() {
		const formData = new FormData(this.form);
		Cliente.nextId = this.setMaxID(this.getData());
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
		for (const cliente of data) {
			this.addRowOnTable(cliente);
		}
	}
	addRowOnTable(cliente: Cliente) {
		let newRow;
		const controls = this.getButtons();

		controls.btn_edit.id = "btn_edit_" + cliente.id;
		controls.btn_remove.id = "btn_remove_" + cliente.id;
		const bodyTable = this.table.querySelector("tbody") as HTMLElement;
		newRow = `
		<tr>
			<td scope="row">${cliente.id}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.apellidos}</td>
                <td>${cliente.dni}</td>
                <td>${cliente.fecha_nac}</td>
                <td>${cliente.email}</td>
                <td>${cliente.password}</td>
				<td>${controls.btn_edit.outerHTML}</td>
				<td>${controls.btn_remove.outerHTML}</td>
		</tr>`;
		bodyTable.innerHTML += newRow;
		const btn_edit = document.getElementById("btn_edit_" + cliente.id) as HTMLButtonElement;
		const btn_remove = document.getElementById("btn_remove_" + cliente.id) as HTMLButtonElement;
		btn_edit.addEventListener("click", (e) => this.editData(e));
		btn_remove.addEventListener("click", (e) => this.removeData(e));

	}
	setConfigEyePassword() {
		const toggler = document.querySelector(".toggle-password") as HTMLSpanElement;
		const eye = document.querySelector(".toggler") as HTMLElement;
		const passwordContainer = document.querySelector("#pass_password") as HTMLInputElement;
		toggler.onclick = (event: Event) => {
			event.preventDefault();
			//eye.classList.toggle("fa-eye fa-eye-slash");
			if (passwordContainer.type == "password") {
				passwordContainer.type = "text";
				eye.classList.replace("fa-eye-slash", "fa-eye");
			} else {
				passwordContainer.type = "password";
				eye.classList.replace("fa-eye", "fa-eye-slash");
			}
		}
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
	}

}
class VentaList extends EntityLocalData {
	constructor() {
		super("ventas", "venta");
		this.configEmpezar();
	}
	selectDataOfTable() {
		const formData = new FormData(this.form);
		const ventaBruto = {
			select_cliente: formData.get('select_cliente') as string,
			select_productos: formData.get('select_productos') as string,
			num_cantidad: parseInt(formData.get('num_cantidad') as string)
		}
		/*const venta = new Cliente(
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
		return cliente;*/
	}
	setDataOnForm(selected: any) {
		throw new Error("Method not implemented.");
	}
	printDataOnTable() {
		throw new Error("Method not implemented.");
	}
	addRowOnTable(item: any) {
		throw new Error("Method not implemented.");
	}
	//Self methods
	configEmpezar() {
		const btn_empezar = document.getElementById("btn_empezar") as HTMLButtonElement;
		btn_empezar.onclick = () => {
			const formGroupClient = this.form.querySelector(".d-none") as HTMLDivElement;

			btn_empezar.style.display = "none";
			this.form.classList.remove("d-none");
			formGroupClient.classList.remove("d-none");

			this.loadClients();

		}
	}
	loadClients() {
		const data: Array<Cliente> = new ClienteList().getData();
		const inputSelect = document.getElementById("select_cliente") as HTMLSelectElement;
		for (let i = 0; i < data.length; i++) {
			const newOption = document.createElement("option");
			const cliente: Cliente = data[i];
			newOption.innerHTML = `${cliente.id}.- ${cliente.nombre} - ${cliente.dni}`;
			newOption.value = cliente.id.toString();
			inputSelect.appendChild(newOption);
		}
		inputSelect.onchange = () => {
			if (inputSelect.value != "#") {
				const formGroupProductoCantidad = this.form.querySelector(".d-none") as HTMLDivElement;
				const productoCantidad = formGroupProductoCantidad.querySelectorAll(".form-group") as NodeList;
				const productoDiv = productoCantidad.item(0) as HTMLDivElement;
				const cantidadDiv = productoCantidad.item(1) as HTMLDivElement;
				const inputProducto = document.getElementById("select_productos") as HTMLSelectElement;

				formGroupProductoCantidad.classList.remove("d-none");
				cantidadDiv.classList.add("d-none");
				inputProducto.disabled = false;
				this.loadProductos();

				inputProducto.onchange = () => {
					if (inputProducto.value != "#") {
						cantidadDiv.classList.remove("d-none");
					}
				}



			} else {

			}
		}
	}
	loadProductos() {
		const data: Array<Producto> = new ProductoList().getData();
		const inputSelect = document.getElementById("select_productos") as HTMLSelectElement;
		console.log(data);
		for (let i = 0; i < data.length; i++) {
			const newOption = document.createElement("option");
			const producto: Producto = data[i];
			console.log(producto);
			newOption.innerHTML = `${producto.id}.- ${producto.familia} - ${producto.precio}`;
			newOption.value = producto.id.toString();
			inputSelect.appendChild(newOption);
		}
	}

	configAddProduct() {

	}

}