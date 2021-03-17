<?php 
//Capturamos el datos que viene del formulario con $_POST de php.

$contenido = $_REQUEST["param"]; //Asignamos a la variable $contenido el parámetro (string JSON generado en JS) que le hemos pasado al servidor.
$f = fopen("../json/productos.json", 'w+b'); //Asignamos a la variable $f el fichero en el que queremos guardar nuestro string y las opciones para sobrescribir TODO el contenido.
fwrite($f,$contenido); //Ahora guardamos los datos de nuestro string $contenido, en nuestro fichero $f. NO AÑADE DATOS, GUARDA LO QUE LE HEMOS PASADO POR PARÁMETRO.
fclose($f);//Cerramos nuestro fichero.
?>