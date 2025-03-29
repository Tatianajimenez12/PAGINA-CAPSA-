<?php
$host = 'localhost';
$dbname = 'sistema_pagos';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    // Configurar PDO para que muestre errores SQL
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    
    // Verificar conexión ejecutando una consulta simple
    $conn->query("SELECT 1");
} catch(PDOException $e) {
    // Guardar error en archivo log
    error_log('['.date('Y-m-d H:i:s').'] Error de conexión: '.$e->getMessage()."\n", 3, 'error.log');
    
    // Mostrar mensaje seguro en producción
    die("Error crítico: No se pudo conectar a la base de datos. Por favor intente más tarde.");
    
    // Para desarrollo puedes mostrar más detalles:
    // die("Error de conexión: " . $e->getMessage());
}
?>