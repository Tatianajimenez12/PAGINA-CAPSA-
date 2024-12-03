<?php
// Configuración de la base de datos
$host = "localhost";
$user = "root";
$password = "";
$database = "vuelos";

// Conexión a la base de datos
$conn = new mysqli($host, $user, $password, $database);

// Verificar la conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Consulta SQL para obtener los datos
$sql = "SELECT id, o, d FROM datos";
$result = $conn->query($sql);

// Verificar si la consulta devolvió resultados
$data = array();
if ($result->num_rows > 0) {
    // Recorrer los resultados y añadirlos al arreglo
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    // Imprimir el arreglo en formato JSON
    echo json_encode($data);
} else {
    echo json_encode(array("mensaje" => "No se encontraron resultados."));
}

// Cerrar la conexión
$conn->close();
?>
