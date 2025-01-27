<?php
// Configuración de la base de datos
$servername = "localhost";
$username = "root";  
$password = "";      
$dbname = "vuelos";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// Obtener los valores de id, o, y d desde POST o GET
$id = isset($_POST['id']) ? $_POST['id'] : (isset($_GET['id']) ? $_GET['id'] : null);
$origen = isset($_POST['o']) ? $_POST['o'] : (isset($_GET['o']) ? $_GET['o'] : null);
$destino = isset($_POST['d']) ? $_POST['d'] : (isset($_GET['d']) ? $_GET['d'] : null);

// Verificar que los datos han sido enviados
if ($id && $origen && $destino) {
    // Preparar la consulta de inserción
    $sql = "INSERT INTO datos (id, o, d) VALUES ('$id', '$origen', '$destino')";

    if ($conn->query($sql) === TRUE) {
        echo "Registro exitoso";
    } else {
        echo "Error al guardar el registro: " . $conn->error;
    }
} else {
    echo "Faltan datos";
}

// Cerrar la conexión
$conn->close();
?>
