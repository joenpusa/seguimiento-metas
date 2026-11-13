# Documentación Oficial de Integración - API de Seguimiento de Metas PDD
**Gobernación de Norte de Santander**  
**Plan de Desarrollo Departamental: "Norte Territorio de Paz" (2024-2027)**

---

## 1. Información General y Entorno de Producción

La API del sistema de seguimiento de metas está desarrollada bajo el estándar **REST**, utiliza **JSON** para el intercambio de datos y autenticación basada en **JWT (JSON Web Tokens)**.

* **URL Base de la API (Producción):**  
  `https://apiseguimientopdd.nortedesantander.gov.co`
* **Aplicación Web (Producción):**  
  `https://seguimientopdd.nortedesantander.gov.co`
* **Cabeceras estándar requeridas:**  
  * `Content-Type: application/json`
  * `Authorization: Bearer <ACCESS_TOKEN>` *(requerido en todos los endpoints protegidos)*

> **Nota técnica sobre certificados SSL:**  
> Si su cliente HTTP (por ejemplo `curl`, librerías internas o entornos corporativos) no tiene instalada la cadena de certificados intermedia del dominio gubernamental y genera un error `SSL certificate problem: unable to get local issuer certificate` (código 60), agregue el parámetro `-k` o `--insecure` en `curl`, o configure su cliente HTTP para confiar en la autoridad certificadora del servidor.

---

## 2. Autenticación y Obtención del Token (Login)

Para interactuar con la API desde cualquier aplicación externa, primero debe autenticarse utilizando las credenciales asignadas.

### Credenciales de Acceso
* **Usuario (email):** `apigober@nortedesantander.gov.co`
* **Contraseña:** `Pass.2026`
* **Rol asignado:** `admin` *(permite lectura global y acciones administrativas sobre el sistema)*

---

### Endpoint: Iniciar Sesión (`POST /api/auth/login`)

* **Método:** `POST`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/auth/login`
* **Cabeceras:** `Content-Type: application/json`

#### Parámetros del Body (JSON)
| Parámetro | Tipo | Obligatorio | Descripción |
| :--- | :--- | :---: | :--- |
| `email` | `string` | Sí | Correo electrónico del usuario (`apigober@nortedesantander.gov.co`). |
| `password` | `string` | Sí | Contraseña de acceso (`Pass.2026`). |

#### Ejemplo en cURL
```bash
curl -k -X POST https://apiseguimientopdd.nortedesantander.gov.co/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apigober@nortedesantander.gov.co",
    "password": "Pass.2026"
  }'
```

#### Respuesta Exitosa (`200 OK`)
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": null,
  "user": {
    "id_usuario": 9,
    "email": "apigober@nortedesantander.gov.co",
    "nombre": "apiGober",
    "rol": "admin",
    "es_activo": 1,
    "id_secretaria": 13,
    "requiereCambioClave": 1
  }
}
```

#### Respuesta de Error (`401 Unauthorized`)
```json
{
  "message": "Credenciales incorrectas"
}
```

> **Importante:**
> 1. El `accessToken` tiene una vigencia estándar de **8 horas**. Una vez expire, debe realizar una nueva solicitud de login para obtener un token nuevo.
> 2. Cada llamada a los endpoints protegidos debe incluir la cabecera:
>    ```http
>    Authorization: Bearer <accessToken>
>    ```

---

## 3. Contexto Base: Planes de Desarrollo

Para consultar cualquier información de metas, la API requiere saber a cuál **Plan de Desarrollo** (`idPlan`) corresponden. En producción, el plan vigente activo es el `id_plan: 2` (**"Norte Territorio de Paz"**).

### Endpoint: Listar Planes de Desarrollo (`GET /api/planes-desarrollo`)

* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/planes-desarrollo`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

#### Ejemplo en cURL
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/planes-desarrollo" \
  -H "Authorization: Bearer $TOKEN"
```

#### Respuesta Exitosa (`200 OK`)
```json
[
  {
    "id_plan": 2,
    "nombre_plan": "Norte Territorio de Paz",
    "vigencia_inicio": "2024-01-01",
    "vigencia_fin": "2027-12-31",
    "es_activo": 1,
    "created_at": "2026-01-06T11:03:14.000Z"
  }
]
```

---

## 4. Consulta de Metas

### 4.1. Listado General de Metas con Filtros (`GET /api/metas`)

Permite obtener el listado de metas del Plan de Desarrollo con sus acumulados físicos, financieros, porcentajes de avance y estado de progreso.

* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

#### Parámetros de Consulta (Query Parameters)
| Parámetro | Tipo | Obligatorio | Descripción | Ejemplo |
| :--- | :--- | :---: | :--- | :--- |
| `idPlan` | `number` | **Sí** | Identificador del Plan de Desarrollo. | `2` |
| `responsableId`| `number` | No | ID de la Secretaría responsable. | `2` *(Secretaría de TICs)* |
| `municipioId` | `number` | No | ID del municipio asociado a la meta. | `3` *(Ábrego)* |
| `q` | `string` | No | Búsqueda por coincidencia en código, nombre o descripción. | `conectados` |
| `estadoProgreso`| `string` | No | Filtro por estado: `SIN_INICIAR`, `EN_EJECUCION` o `COMPLETADA`. | `EN_EJECUCION` |

> **Nota:** Si no se aplican filtros opcionales (`responsableId`, `municipioId`, `q`, `estadoProgreso`), la API aplica un límite por defecto de 100 registros. Al aplicar cualquiera de los filtros opcionales, retorna la totalidad de las coincidencias.

#### Ejemplo 1: Consultar todas las metas del plan activo (idPlan=2)
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/metas?idPlan=2" \
  -H "Authorization: Bearer $TOKEN"
```

#### Ejemplo 2: Filtrar metas de una secretaría específica con búsqueda de texto
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/metas?idPlan=2&responsableId=2&q=digital" \
  -H "Authorization: Bearer $TOKEN"
```

#### Ejemplo 3: Filtrar por estado de progreso
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/metas?idPlan=2&estadoProgreso=COMPLETADA" \
  -H "Authorization: Bearer $TOKEN"
```

#### Estructura de Respuesta (`200 OK`)
Retorna un arreglo de objetos meta:
```json
[
  {
    "id_meta": 12,
    "codigo": "117",
    "nombre": "Municipios y áreas no municipalizadas conectados a redes de servicio",
    "descripcion": "Municipios y áreas no municipalizadas conectados a redes de servicio",
    "id_detalle": 35,
    "id_unidad": 15,
    "unidad_nombre": "Municipios",
    "id_secretaria": 2,
    "secretaria_nombre": "Secretaría de TICs",
    "fecha_limite": "2027-12-31",
    "recurrente": 0,

    "cant_ano1": 0,
    "cant_ano2": 4,
    "cant_ano3": 4,
    "cant_ano4": 2,
    "cantidad": 10,

    "acumulado_fisico": 26,
    "porcentaje_fisico": 100,

    "val1_pro": 0,
    "val2_pro": 39.61,
    "val3_pro": 42.77,
    "val4_pro": 46.2,
    "val1_sgp": 0,
    "val2_sgp": 0,
    "val3_sgp": 0,
    "val4_sgp": 0,
    "val1_reg": 0,
    "val2_reg": 10000,
    "val3_reg": 5000,
    "val4_reg": 0,
    "val1_mun": 0,
    "val2_mun": 15000,
    "val3_mun": 15000,
    "val4_mun": 20000,
    "val1_cre": 0, "val2_cre": 0, "val3_cre": 0, "val4_cre": 0,
    "val1_otr": 0, "val2_otr": 0, "val3_otr": 0, "val4_otr": 0,

    "porcentaje_financiero": 49.46,
    "estadoProgreso": "COMPLETADA",

    "linea_id": 30,
    "linea_codigo": "1",
    "linea_nombre": "DESARROLLO ECONÓMICO SOSTENIBLE Y COMPETITIVIDAD",
    "componente_id": 32,
    "componente_codigo": "1.7",
    "componente_nombre": "TIC - CTeI",
    "apuesta_id": 33,
    "apuesta_codigo": "1.7.1",
    "apuesta_nombre": "CONECTIVIDAD: Cerrando Brechas Digitales",
    "iniciativa_id": 35,
    "iniciativa_codigo": "1.7.1.1",
    "iniciativa_nombre": "Instalación, ampliación de cobertura, fortalecimiento...",

    "cantidad_0_5": 0,
    "cantidad_6_12": 0,
    "cantidad_13_17": 0,
    "cantidad_18_24": 0,
    "cantidad_25_62": 0,
    "cantidad_65_mas": 0,
    "cantesp_mujer": 0,
    "cantesp_discapacidad": 0,
    "cantesp_etnia": 0,
    "cantesp_victima": 0,
    "cantesp_desmovilizado": 0,
    "cantesp_lgtbi": 0,
    "cantesp_migrante": 0,
    "cantesp_indigente": 0,
    "cantesp_privado": 0,
    "created_at": "2026-01-07T15:07:18.000Z"
  }
]
```

---

### 4.2. Consulta de Meta por ID (`GET /api/metas/:id`)

Retorna toda la ficha técnica de una meta en particular, incluyendo sus valores acumulados de gastos por fuente, población beneficiada y la distribución de municipios con vigencias donde se han reportado avances.

* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas/:id`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

#### Parámetros de Ruta (Path Parameters)
| Parámetro | Tipo | Obligatorio | Descripción |
| :--- | :--- | :---: | :--- |
| `id` | `number` | Sí | Identificador único de la meta (ej. `12`). |

#### Ejemplo en cURL
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/metas/12" \
  -H "Authorization: Bearer $TOKEN"
```

#### Campos Clave de la Respuesta (`200 OK`)
Además de los datos generales de la meta, esta consulta desglosa:
* `acumulado_pro`, `acumulado_sgp`, `acumulado_reg`, `acumulado_cre`, `acumulado_mun`, `acumulado_otr`: Total de gastos ejecutados por fuente de financiación.
* `total_gasto`: Total ejecutado en presupuesto.
* `acumulado_0_5` a `acumulado_65_mas`: Beneficiarios reales por grupo etario.
* `acumulado_mujer`, `acumulado_discapacidad`, `acumulado_victima`, etc.: Beneficiarios con enfoque diferencial.
* `municipios`: Arreglo de IDs de municipios vinculados a la meta (ej. `[1, 3, 9, 12, ...]`).
* `municipios_vigencias`: Arreglo de objetos con el reporte de vigencias y años por municipio:
  ```json
  [
    {"id_municipio": 3, "vigencias": 2, "anio": "2024"},
    {"id_municipio": 4, "vigencias": 1, "anio": "2025"}
  ]
  ```

---

### 4.3. Seguimiento Detallado Trimestral: Programado vs. Ejecutado (`GET /api/metas/seguimiento/:id`)

Esta es una de las APIs más completas para sistemas analíticos o tableros de control. Retorna la información general de la meta junto con un desglose cronológico de cada trimestre (T1, T2, T3, T4) contrastando la cantidad y los gastos **programados** frente a los **avances reales reportados**.

* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas/seguimiento/:id`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

#### Ejemplo en cURL
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/metas/seguimiento/12" \
  -H "Authorization: Bearer $TOKEN"
```

#### Estructura de Respuesta (`200 OK`)
```json
{
  "meta": {
    "id_meta": 12,
    "codigo": "117",
    "nombre": "Municipios y áreas no municipalizadas conectados...",
    "meta_total_cantidad_raw": 10,
    "meta_total_presupuesto_raw": 65128.58,
    "secretaria_nombre": "Secretaría de TICs",
    "unidad_nombre": "Municipios",
    "linea_nombre": "DESARROLLO ECONÓMICO SOSTENIBLE Y COMPETITIVIDAD",
    "componente_nombre": "TIC - CTeI",
    "apuesta_nombre": "CONECTIVIDAD: Cerrando Brechas Digitales",
    "iniciativa_nombre": "Instalación, ampliación de cobertura..."
  },
  "detalles": [
    {
      "anio": "2024",
      "trimestre": "T1",
      "programacion_cantidad": 0,
      "programacion_gastos": 0,
      "avance_cantidad": 0,
      "avance_gastos": 0,
      "porcentaje_cumplimiento_fisico": 0,
      "porcentaje_cumplimiento_financiero": 0,
      "poblacion_total_reportada": 0
    },
    {
      "anio": "2025",
      "trimestre": "T3",
      "programacion_cantidad": 0,
      "programacion_gastos": 341,
      "prog_gasto_pro": 341,
      "prog_gasto_sgp": 0,
      "prog_gasto_reg": 0,
      "avance_cantidad": 21,
      "avance_gastos": 32173.7,
      "av_gasto_pro": 2173.7,
      "av_gasto_mun": 30000,
      "porcentaje_cumplimiento_fisico": 100,
      "porcentaje_cumplimiento_financiero": 49.46,
      "poblacion_total_reportada": 49362
    }
  ]
}
```

---

### 4.4. Metas por Detalle del Plan (`GET /api/metas/detalle/:idDetalle`)

Permite obtener todas las metas asociadas a un nodo específico de la estructura del plan (por ejemplo, a una iniciativa particular).

* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas/detalle/:idDetalle`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

#### Ejemplo en cURL
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/metas/detalle/35" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 5. Trazabilidad: Programaciones y Avances Reportados

Si la aplicación externa necesita consultar el historial de planeación y la ejecución periódica con evidencias:

### 5.1. Consultar Programación Trimestral de una Meta (`GET /api/programaciones/meta/:idMeta`)

Lista los períodos planificados para la meta, con sus metas físicas, presupuestos y el estado del período (`reportado`, `vencido`, etc.).

* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/programaciones/meta/:idMeta`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

#### Ejemplo en cURL
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/programaciones/meta/12" \
  -H "Authorization: Bearer $TOKEN"
```

#### Respuesta Ejemplo
```json
[
  {
    "id_programacion": 165,
    "id_meta": 12,
    "anio": "2025",
    "trimestre": "T1",
    "cantidad_programada": 2,
    "gasto_programado": 76,
    "gasto_programado_pro": 76,
    "id_avance": 153,
    "cantidad_avance": 4,
    "gasto_avance": 0,
    "estado": "reportado"
  }
]
```

---

### 5.2. Consultar Avances Registrados (`GET /api/avances`)

Permite obtener los reportes periódicos de ejecución con descripción cualitativa del avance, gastos y archivos de soporte adjuntos.

* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/avances`
* **Cabecera:** `Authorization: Bearer <TOKEN>`
* **Parámetros Query:**
  * `idPlan` (Obligatorio, numérico): ID del plan (ej. `2`).
  * `idMeta` (Opcional, numérico): Filtrar por una meta específica (ej. `12`).
  * `anio` (Opcional, string): Filtrar por año (ej. `2025`).
  * `trimestre` (Opcional, string): Filtrar por trimestre (`T1`, `T2`, `T3`, `T4`).

#### Ejemplo en cURL
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/avances?idPlan=2&idMeta=12" \
  -H "Authorization: Bearer $TOKEN"
```

#### Respuesta Ejemplo
```json
[
  {
    "id_avance": 223,
    "anio": "2025",
    "trimestre": "T3",
    "id_meta": 12,
    "descripcion": "Se han conectado 6.668 hogares en Cúcuta, 1.840 en Villa del Rosario...",
    "cantidad": 21,
    "gasto_pro": 2173.7,
    "gasto_mun": 30000,
    "meta_nombre": "Municipios y áreas no municipalizadas conectados...",
    "porcentaje_fisico": 100,
    "porcentaje_financiero": 49.46,
    "es_ultimo": 0
  }
]
```

---

## 6. Tablas Maestras y Catálogos de Referencia

Para decodificar los IDs devueltos por las metas o para alimentar filtros en su aplicación:

### 6.1. Secretarías / Dependencias (`GET /api/secretarias`)
Lista todas las entidades ejecutoras responsables de las metas.
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/secretarias" \
  -H "Authorization: Bearer $TOKEN"
```
*Campos:* `id_secretaria`, `nombre`, `es_activo`.

### 6.2. Municipios de Norte de Santander (`GET /api/municipios`)
Lista los municipios del departamento.
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/municipios" \
  -H "Authorization: Bearer $TOKEN"
```
*Campos:* `id_municipio`, `codigo_municipio`, `nombre`, `id_zona` *(ej. Centro, Norte, Occidente, Sur, etc.)*, `activo`.

### 6.3. Unidades de Medida (`GET /api/unidades`)
Catálogo de unidades de medida para las cantidades de las metas (ej: Kilómetros, Porcentaje, Municipios, Becas, etc.).
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/unidades" \
  -H "Authorization: Bearer $TOKEN"
```
*Campos:* `id_unidad`, `nombre`, `codigo`.

### 6.4. Estructura Jerárquica del Plan (`GET /api/detalles-plan/:idPlan`)
Permite reconstruir el árbol estratégico del Plan de Desarrollo: **Líneas** ➔ **Componentes** ➔ **Apuestas** ➔ **Iniciativas**.
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/detalles-plan/2" \
  -H "Authorization: Bearer $TOKEN"
```
*Campos:* `id_detalle`, `nombre_detalle`, `id_detalle_padre`, `codigo`, `tipo` (`linea`, `componente`, `apuesta`, `iniciativa`).

---

## 7. Reportes Consolidados y Estadísticas

Para consultar datos agregados y tableros de resumen ejecutivo sin procesar meta por meta:

### 7.1. Reporte General con Distribución de Cumplimiento (`POST /api/reports/general`)
Calcula los rangos de cumplimiento y distribución de avance general para un año y trimestre dado.

* **Método:** `POST`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/reports/general`
* **Cabeceras:**  
  `Authorization: Bearer <TOKEN>`  
  `Content-Type: application/json`
* **Body:**
  ```json
  {
    "idPlan": 2,
    "year": "2025",
    "quarter": "T3"
  }
  ```

#### Ejemplo en cURL
```bash
curl -k -X POST "https://apiseguimientopdd.nortedesantander.gov.co/api/reports/general" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"idPlan": 2, "year": "2025", "quarter": "T3"}'
```

#### Respuesta Ejemplo
```json
{
  "plan": {
    "id_plan": 2,
    "nombre_plan": "Norte Territorio de Paz"
  },
  "counts": {
    "rango0": 15,
    "rango_low": 20,
    "rango_mid": 45,
    "rango_high": 35,
    "rango100": 80
  },
  "totalMetas": 195
}
```

Otros reportes disponibles bajo el mismo esquema de parámetros (`idPlan`, `year`, `quarter`):
* `POST /api/reports/lineas` (Avance agrupado por Líneas estratégicas)
* `POST /api/reports/secretarias` (Avance agrupado por Secretarías)
* `POST /api/reports/arbol` (Árbol completo de avance; solo requiere `{"idPlan": 2}`)

---

## 8. Acciones de Escritura sobre Metas (Creación, Actualización y Eliminación)

El usuario `apigober@nortedesantander.gov.co` tiene rol de **`admin`**, lo que le otorga permisos para realizar operaciones de creación y mantenimiento sobre las metas.

### 8.1. Crear una Meta (`POST /api/metas`)
* **Método:** `POST`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas`
* **Cabecera:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

#### Ejemplo en cURL
```bash
curl -k -X POST "https://apiseguimientopdd.nortedesantander.gov.co/api/metas" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "META-2026-01",
    "nombre": "Implementación de red comunitaria de conectividad",
    "descripcion": "Instalación de antenas de conectividad en zonas rurales",
    "id_detalle": 35,
    "id_unidad": 15,
    "id_secretaria": 2,
    "fecha_limite": "2027-12-31",
    "recurrente": 0,
    "cant_ano1": 2,
    "cant_ano2": 3,
    "cant_ano3": 3,
    "cant_ano4": 2,
    "val1_pro": 1000,
    "val2_pro": 1500,
    "val3_pro": 1500,
    "val4_pro": 1000,
    "municipios": [3, 8, 9]
  }'
```

### 8.2. Actualizar una Meta (`PUT /api/metas/:id`)
* **Método:** `PUT`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas/12`
* **Cabecera:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

### 8.3. Eliminar una Meta (`DELETE /api/metas/:id`)
* **Método:** `DELETE`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas/:id`
* **Cabecera:** `Authorization: Bearer <TOKEN>`
> **Restricción:** No se puede eliminar una meta si ya cuenta con avances o programaciones asociadas.

---

## 9. Script de Ejemplo de Integración Rápida

### Script en Bash (Linux / macOS)
Guarde este script como `consultar_metas.sh` para probar la conexión inmediata:

```bash
#!/usr/bin/env bash
set -e

API_URL="https://apiseguimientopdd.nortedesantander.gov.co"
EMAIL="apigober@nortedesantander.gov.co"
PASSWORD="Pass.2026"

echo "1. Autenticando en la API..."
LOGIN_RESPONSE=$(curl -k -s -X POST "${API_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${EMAIL}\", \"password\": \"${PASSWORD}\"}")

# Extraer el token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Error al obtener el token. Respuesta del servidor:"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "Autenticado con éxito. Token obtenido."

echo "2. Consultando metas del Plan 2..."
curl -k -s -X GET "${API_URL}/api/metas?idPlan=2" \
  -H "Authorization: Bearer ${TOKEN}" | head -n 30

echo -e "\nConsulta finalizada con éxito."
```

### Ejemplo en Node.js (JavaScript / Fetch)
```javascript
const API_URL = "https://apiseguimientopdd.nortedesantander.gov.co";

async function consultarMetas() {
  // 1. Iniciar Sesión
  const loginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "apigober@nortedesantander.gov.co",
      password: "Pass.2026"
    })
  });

  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  console.log("Token obtenido exitosamente.");

  // 2. Consultar Metas Filtradas
  const metasRes = await fetch(`${API_URL}/api/metas?idPlan=2`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const metas = await metasRes.json();
  console.log(`Se obtuvieron ${metas.length} metas.`);
  console.log("Primera meta:", metas[0]);
}

consultarMetas().catch(console.error);
```

### Ejemplo en Python (`requests`)
```python
import requests

API_URL = "https://apiseguimientopdd.nortedesantander.gov.co"

# 1. Login
login_payload = {
    "email": "apigober@nortedesantander.gov.co",
    "password": "Pass.2026"
}

session = requests.Session()
# Nota: verify=False si su entorno no valida el certificado intermedio de la gobernación
res = session.post(f"{API_URL}/api/auth/login", json=login_payload, verify=False)
res.raise_for_status()
token = res.json()["accessToken"]

headers = {
    "Authorization": f"Bearer {token}"
}

# 2. Consultar Metas
params = {
    "idPlan": 2,
    "estadoProgreso": "EN_EJECUCION"
}
metas_res = session.get(f"{API_URL}/api/metas", headers=headers, params=params, verify=False)
metas = metas_res.json()

print(f"Total de metas en ejecución: {len(metas)}")
for meta in metas[:3]:
    print(f"- [{meta['codigo']}] {meta['nombre']} -> Avance Físico: {meta['porcentaje_fisico']}%")
```

---

## 10. Glosario de Campos Financieros y Poblacionales

* **Fuentes de Financiación:**
  * `pro`: Recursos Propios del Departamento.
  * `sgp`: Sistema General de Participaciones.
  * `reg`: Sistema General de Regalías.
  * `cre`: Recursos del Crédito.
  * `mun`: Aportes de Municipios.
  * `otr`: Otras fuentes de financiación / Cooperación.
  * *Estructura:* `val1_*` representa el año 2024, `val2_*` el año 2025, `val3_*` el año 2026 y `val4_*` el año 2027.
* **Enfoques Diferenciales y Grupos de Población:**
  * `cantidad_0_5`: Primera Infancia (0 a 5 años).
  * `cantidad_6_12`: Infancia (6 a 12 años).
  * `cantidad_13_17`: Adolescencia (13 a 17 años).
  * `cantidad_18_24`: Juventud (18 a 24 años).
  * `cantidad_25_62`: Adultos (25 a 62 años).
  * `cantidad_65_mas`: Personas Mayores (65 años en adelante).
  * `cantesp_*`: Población de especial protección constitucional (Mujeres, Personas con Discapacidad, Grupos Étnicos, Víctimas del Conflicto Armado, Desmovilizados, Comunidad LGTBI, Migrantes, Indigentes, Personas Privadas de la Libertad).
