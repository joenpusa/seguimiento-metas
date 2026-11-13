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

Para interactuar con la API desde cualquier aplicación externa, primero debe autenticarse utilizando las credenciales asignadas para obtener un **token de acceso (JWT)**. Este token debe incluirse en la cabecera `Authorization` de cada solicitud subsecuente.

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
    "requiereCambioClave": 0
  }
}
```

#### Respuesta de Error (`401 Unauthorized`)
```json
{
  "message": "Credenciales incorrectas"
}
```

> **Importante para la Integración:**
> 1. El `accessToken` tiene una vigencia estándar de **8 horas**. Una vez expire, debe realizar una nueva solicitud de login para renovarlo.
> 2. Cada llamada a los endpoints protegidos debe incluir la cabecera:
>    ```http
>    Authorization: Bearer <accessToken>
>    ```

---

## 3. Contexto: Planes de Desarrollo y Resolución Automática del Plan Activo

El sistema almacena metas asociadas a diferentes Planes de Desarrollo Departamentales (por ejemplo, planes históricos y el plan vigente).

> [!IMPORTANT]
> **Resolución Automática del Plan Activo:**  
> Dado que una aplicación externa desconoce los identificadores internos (`id_meta` o `id_plan`), y dado que un **código de meta** puede repetirse entre distintos planes de desarrollo, **la API resuelve y entrega automáticamente los datos del Plan de Desarrollo que se encuentra ACTIVO en el momento dentro del proyecto** (`es_activo = 1`).  
> 
> Usted no necesita conocer ni enviar el `idPlan` para consultar las metas o sus detalles por código; la API siempre responderá con la información del plan vigente actual.

Si su integración requiere conocer el plan actualmente activo o listar los planes registrados:

### Endpoint: Consultar Plan de Desarrollo Activo (`GET /api/planes-desarrollo/activo`)
* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/planes-desarrollo/activo`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

#### Ejemplo en cURL
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/planes-desarrollo/activo" \
  -H "Authorization: Bearer $TOKEN"
```

#### Respuesta Exitosa (`200 OK`)
```json
{
  "id_plan": 2,
  "nombre_plan": "Norte Territorio de Paz",
  "vigencia_inicio": "2024-01-01",
  "vigencia_fin": "2027-12-31",
  "es_activo": 1,
  "created_at": "2026-01-06T11:03:14.000Z"
}
```

### Endpoint: Listar Todos los Planes de Desarrollo (`GET /api/planes-desarrollo`)
* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/planes-desarrollo`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

---

## 4. Consulta de Metas

### 4.1. Listado General de Metas (`GET /api/metas`)

Permite obtener el listado de metas del Plan de Desarrollo con sus acumulados físicos, financieros, porcentajes de avance y estado de progreso.  
**Si no se indica `idPlan`, la API entrega automáticamente las metas del Plan de Desarrollo actualmente ACTIVO.**

* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

#### Parámetros de Consulta (Query Parameters)
| Parámetro | Tipo | Obligatorio | Descripción | Ejemplo |
| :--- | :--- | :---: | :--- | :--- |
| `codigo` | `string` | No | Filtro exacto por el código o número de la meta. | `117` |
| `idPlan` | `number` | No | ID del Plan de Desarrollo. *(Si se omite, se usa el plan activo).* | `2` |
| `responsableId`| `number` | No | ID de la Secretaría responsable. | `2` *(Secretaría de TICs)* |
| `municipioId` | `number` | No | ID del municipio asociado a la meta. | `3` *(Ábrego)* |
| `q` | `string` | No | Búsqueda por coincidencia en código, nombre o descripción. | `conectados` |
| `estadoProgreso`| `string` | No | Filtro por estado: `SIN_INICIAR`, `EN_EJECUCION` o `COMPLETADA`. | `EN_EJECUCION` |
| `limit` | `number/string` | No | Límite de registros a retornar (ej. `50` o `all` para todos). | `all` |

> **Nota de paginación/límite:** Si no se aplican filtros, la API retorna hasta 100 registros por defecto. Para obtener la totalidad de las metas del plan activo, puede pasar `limit=all` o utilizar filtros específicos.

#### Ejemplo 1: Consultar las metas del plan de desarrollo activo
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/metas" \
  -H "Authorization: Bearer $TOKEN"
```

#### Ejemplo 2: Filtrar metas por código específico
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/metas?codigo=117" \
  -H "Authorization: Bearer $TOKEN"
```

#### Ejemplo 3: Filtrar por secretaría responsable y texto
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/metas?responsableId=2&q=digital" \
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
    "id_plan": 2,
    "plan_nombre": "Norte Territorio de Paz",
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

### 4.2. Consulta de Meta Específica por Código (`GET /api/metas/codigo/:codigo`)

> [!TIP]
> **Endpoint recomendado para integraciones externas:**  
> Permite obtener la ficha técnica completa de una meta utilizando su **código o número de meta**, sin necesidad de conocer los identificadores (`ID`) internos. Si un código existiese en varios planes, la API **siempre retornará la meta correspondiente al Plan de Desarrollo actualmente activo**.

* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas/codigo/:codigo`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

#### Parámetros de Ruta (Path Parameters)
| Parámetro | Tipo | Obligatorio | Descripción | Ejemplo |
| :--- | :--- | :---: | :--- | :--- |
| `codigo` | `string` | Sí | Código o número oficial de la meta registrado en el plan. | `117` |

#### Parámetros de Consulta (Query Parameters)
| Parámetro | Tipo | Obligatorio | Descripción | Ejemplo |
| :--- | :--- | :---: | :--- | :--- |
| `idPlan` | `number` | No | Opcional. Permite consultar el código en un plan específico distinto al activo. | `2` |

#### Ejemplo en cURL
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/metas/codigo/117" \
  -H "Authorization: Bearer $TOKEN"
```

#### Estructura de Respuesta (`200 OK`)
Retorna el objeto meta con todos sus detalles acumulados, gastos por fuente y desglose territorial:
```json
{
  "id_meta": 12,
  "codigo": "117",
  "nombre": "Municipios y áreas no municipalizadas conectados a redes de servicio",
  "descripcion": "Municipios y áreas no municipalizadas conectados a redes de servicio",
  "id_detalle": 35,
  "id_plan": 2,
  "nombre_plan": "Norte Territorio de Paz",
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

  "acumulado_pro": 2173.7,
  "acumulado_sgp": 0,
  "acumulado_reg": 0,
  "acumulado_cre": 0,
  "acumulado_mun": 30000,
  "acumulado_otr": 0,
  "total_gasto": 32173.7,

  "porcentaje_financiero": 49.46,
  "estadoProgreso": "COMPLETADA",

  "iniciativa_id": 35,
  "iniciativa_codigo": "1.7.1.1",
  "iniciativa_nombre": "Instalación, ampliación de cobertura, fortalecimiento...",
  "apuesta_id": 33,
  "apuesta_codigo": "1.7.1",
  "apuesta_nombre": "CONECTIVIDAD: Cerrando Brechas Digitales",
  "componente_id": 32,
  "componente_codigo": "1.7",
  "componente_nombre": "TIC - CTeI",
  "linea_id": 30,
  "linea_codigo": "1",
  "linea_nombre": "DESARROLLO ECONÓMICO SOSTENIBLE Y COMPETITIVIDAD",

  "acumulado_0_5": 0,
  "acumulado_6_12": 0,
  "acumulado_13_17": 0,
  "acumulado_18_24": 0,
  "acumulado_25_62": 0,
  "acumulado_65_mas": 0,
  "acumulado_mujer": 0,
  "acumulado_discapacidad": 0,
  "acumulado_victima": 0,

  "municipios": [1, 3, 9, 12, 18],
  "municipios_vigencias": [
    {
      "id_municipio": 3,
      "vigencias": 2,
      "anio": "2024"
    },
    {
      "id_municipio": 4,
      "vigencias": 1,
      "anio": "2025"
    }
  ]
}
```

#### Respuesta de Error (`404 Not Found`)
Si el código no existe en el plan activo:
```json
{
  "message": "Meta con código '999' no encontrada en el plan de desarrollo activo"
}
```

---

### 4.3. Seguimiento Detallado Trimestral por Código (`GET /api/metas/codigo/:codigo/seguimiento`)

Permite contrastar de manera cronológica la planeación frente a la ejecución real de una meta por código (Programado vs. Ejecutado) en cada trimestre (T1, T2, T3, T4), con acumulados y avance porcentual.

* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas/codigo/:codigo/seguimiento`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

#### Ejemplo en cURL
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/metas/codigo/117/seguimiento" \
  -H "Authorization: Bearer $TOKEN"
```

#### Estructura de Respuesta (`200 OK`)
```json
{
  "meta": {
    "id_meta": 12,
    "codigo": "117",
    "nombre": "Municipios y áreas no municipalizadas conectados...",
    "id_plan": 2,
    "nombre_plan": "Norte Territorio de Paz",
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

### 4.4. Compatibilidad: Consulta de Meta por ID Interno (`GET /api/metas/:id`)

> **Nota de Compatibilidad:**  
> Si se pasa un identificador numérico, busca por `id_meta`. Si el identificador no existe como ID interno, la API intentará automáticamente localizarlo como **código de meta** dentro del plan de desarrollo activo.

* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas/:id`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

#### Ejemplo en cURL
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/metas/12" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4.5. Metas por Nodo de Estructura / Iniciativa (`GET /api/metas/detalle/:idDetalle`)

Permite obtener todas las metas asociadas a un nodo específico de la estructura del plan (por ejemplo, a una iniciativa particular).

* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas/detalle/:idDetalle`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

---

## 5. Trazabilidad: Programaciones y Avances Reportados

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

---

### 5.2. Consultar Avances Registrados (`GET /api/avances`)

Permite obtener los reportes periódicos de ejecución con descripción cualitativa del avance, gastos y soportes adjuntos.

* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/avances`
* **Cabecera:** `Authorization: Bearer <TOKEN>`
* **Parámetros Query:**
  * `idPlan` (Opcional, numérico): ID del plan.
  * `idMeta` (Opcional, numérico): Filtrar por una meta específica.
  * `anio` (Opcional, string): Filtrar por año (ej. `2025`).
  * `trimestre` (Opcional, string): Filtrar por trimestre (`T1`, `T2`, `T3`, `T4`).

---

## 6. Tablas Maestras y Catálogos de Referencia

### 6.1. Secretarías / Dependencias (`GET /api/secretarias`)
Lista las entidades ejecutoras responsables de las metas.
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/secretarias" \
  -H "Authorization: Bearer $TOKEN"
```

### 6.2. Municipios de Norte de Santander (`GET /api/municipios`)
Lista los municipios del departamento.
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/municipios" \
  -H "Authorization: Bearer $TOKEN"
```

### 6.3. Unidades de Medida (`GET /api/unidades`)
Catálogo de unidades de medida para las cantidades de las metas (ej: Kilómetros, Porcentaje, Municipios, etc.).
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/unidades" \
  -H "Authorization: Bearer $TOKEN"
```

### 6.4. Estructura Jerárquica del Plan (`GET /api/detalles-plan/:idPlan`)
Permite reconstruir el árbol estratégico del Plan de Desarrollo: **Líneas** ➔ **Componentes** ➔ **Apuestas** ➔ **Iniciativas**.
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/detalles-plan/2" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 7. Reportes Consolidados y Estadísticas

Para consultar datos agregados y tableros de resumen ejecutivo sin procesar meta por meta:

### 7.1. Reporte General con Distribución de Cumplimiento (`POST /api/reports/general`)
* **Método:** `POST`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/reports/general`
* **Cabeceras:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
* **Body:** `{"idPlan": 2, "year": "2025", "quarter": "T3"}`

Otros reportes disponibles:
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

### 8.2. Actualizar una Meta (`PUT /api/metas/:id`)
* **Método:** `PUT`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas/:id`
* **Cabecera:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`

### 8.3. Eliminar una Meta (`DELETE /api/metas/:id`)
* **Método:** `DELETE`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas/:id`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

---

## 9. Scripts de Ejemplo de Integración Rápida (Login ➔ Listar ➔ Consultar por Código)

Estos scripts muestran el flujo completo recomendado para la aplicación externa:
1. **Autenticación (Login):** Envía usuario y contraseña a `POST /api/auth/login` y extrae el `accessToken`.
2. **Listado General de Metas:** Llama a `GET /api/metas` (sin requerir ID de plan, entrega las del plan activo).
3. **Consulta de Meta por Código:** Consulta `GET /api/metas/codigo/:codigo` con el número de meta para obtener toda la ficha técnica.
4. **Seguimiento Detallado por Código:** Consulta `GET /api/metas/codigo/:codigo/seguimiento` para ver el avance trimestral.

### 9.1. Script en Bash (Linux / macOS)
Guarde este archivo como `consultar_metas.sh` y ejecútelo con `bash consultar_metas.sh`:

```bash
#!/usr/bin/env bash
set -e

API_URL="https://apiseguimientopdd.nortedesantander.gov.co"
EMAIL="apigober@nortedesantander.gov.co"
PASSWORD="Pass.2026"
CODIGO_META="117"

echo "=========================================================="
echo "1. Autenticando en la API (Login)..."
echo "=========================================================="
LOGIN_RESPONSE=$(curl -k -s -X POST "${API_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${EMAIL}\", \"password\": \"${PASSWORD}\"}")

# Extraer el token de acceso
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Error al obtener el token. Respuesta del servidor:"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "Autenticado con éxito. Token obtenido:"
echo "${TOKEN:0:30}..."

echo ""
echo "=========================================================="
echo "2. Consultando listado de metas del Plan Activo..."
echo "=========================================================="
# No requiere idPlan: toma el plan activo automáticamente
curl -k -s -X GET "${API_URL}/api/metas" \
  -H "Authorization: Bearer ${TOKEN}" | head -n 35

echo ""
echo "=========================================================="
echo "3. Consultando meta específica por Código (${CODIGO_META})..."
echo "=========================================================="
# Consulta directa por código en el plan activo
META_DATA=$(curl -k -s -X GET "${API_URL}/api/metas/codigo/${CODIGO_META}" \
  -H "Authorization: Bearer ${TOKEN}")

echo "$META_DATA" | head -n 35

echo ""
echo "=========================================================="
echo "4. Consultando seguimiento trimestral por Código (${CODIGO_META})..."
echo "=========================================================="
curl -k -s -X GET "${API_URL}/api/metas/codigo/${CODIGO_META}/seguimiento" \
  -H "Authorization: Bearer ${TOKEN}" | head -n 35

echo ""
echo "Flujo completado exitosamente."
```

---

### 9.2. Ejemplo en Node.js (JavaScript / Fetch)

```javascript
const API_URL = "https://apiseguimientopdd.nortedesantander.gov.co";
const CODIGO_META = "117";

async function integracionMetas() {
  // 1. Iniciar Sesión (Login)
  console.log("1. Autenticando en la API...");
  const loginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "apigober@nortedesantander.gov.co",
      password: "Pass.2026"
    })
  });

  if (!loginRes.ok) {
    throw new Error(`Error en login: ${loginRes.status} ${loginRes.statusText}`);
  }

  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  console.log("✓ Token obtenido exitosamente.");

  const headers = {
    "Authorization": `Bearer ${token}`
  };

  // 2. Listar Metas del Plan Activo (sin necesidad de idPlan)
  console.log("\n2. Consultando listado de metas del plan activo...");
  const metasRes = await fetch(`${API_URL}/api/metas`, { headers });
  const metas = await metasRes.json();
  console.log(`✓ Se obtuvieron ${metas.length} metas del plan activo.`);

  // 3. Consultar Meta Específica por Código (en el plan activo)
  console.log(`\n3. Consultando meta con código '${CODIGO_META}'...`);
  const metaRes = await fetch(`${API_URL}/api/metas/codigo/${CODIGO_META}`, { headers });
  
  if (metaRes.ok) {
    const meta = await metaRes.json();
    console.log("✓ Meta encontrada:");
    console.log(`  - Código: ${meta.codigo}`);
    console.log(`  - Nombre: ${meta.nombre}`);
    console.log(`  - Plan: [${meta.id_plan}] ${meta.nombre_plan}`);
    console.log(`  - Secretaría: ${meta.secretaria_nombre}`);
    console.log(`  - Avance Físico: ${meta.porcentaje_fisico}%`);
    console.log(`  - Avance Financiero: ${meta.porcentaje_financiero}%`);
    console.log(`  - Estado: ${meta.estadoProgreso}`);
  } else {
    console.error(`Meta no encontrada (${metaRes.status})`);
  }

  // 4. Consultar Seguimiento Trimestral por Código
  console.log(`\n4. Consultando seguimiento trimestral para código '${CODIGO_META}'...`);
  const segRes = await fetch(`${API_URL}/api/metas/codigo/${CODIGO_META}/seguimiento`, { headers });
  if (segRes.ok) {
    const seguimiento = await segRes.json();
    console.log(`✓ Trimestres reportados: ${seguimiento.detalles.length}`);
  }
}

integracionMetas().catch(console.error);
```

---

### 9.3. Ejemplo en Python (`requests`)

```python
import requests

API_URL = "https://apiseguimientopdd.nortedesantander.gov.co"
CODIGO_META = "117"

# 1. Login y obtención del Token
print("1. Autenticando en la API...")
login_payload = {
    "email": "apigober@nortedesantander.gov.co",
    "password": "Pass.2026"
}

session = requests.Session()
# Nota: verify=False si el entorno no tiene el certificado intermedio del dominio gubernamental
res = session.post(f"{API_URL}/api/auth/login", json=login_payload, verify=False)
res.raise_for_status()

token = res.json()["accessToken"]
print("✓ Autenticado con éxito. Token recibido.")

headers = {
    "Authorization": f"Bearer {token}"
}

# 2. Listar Metas del Plan Activo (sin requerir idPlan)
print("\n2. Consultando metas del plan activo...")
metas_res = session.get(f"{API_URL}/api/metas", headers=headers, verify=False)
metas_res.raise_for_status()
metas = metas_res.json()
print(f"✓ Total de metas obtenidas: {len(metas)}")

# 3. Consultar Meta Específica por Código en el Plan Activo
print(f"\n3. Consultando meta con código '{CODIGO_META}'...")
meta_res = session.get(f"{API_URL}/api/metas/codigo/{CODIGO_META}", headers=headers, verify=False)

if meta_res.status_code == 200:
    meta = meta_res.json()
    print("✓ Detalle de la meta:")
    print(f"  - Código: {meta.get('codigo')}")
    print(f"  - Nombre: {meta.get('nombre')}")
    print(f"  - Plan: [{meta.get('id_plan')}] {meta.get('nombre_plan')}")
    print(f"  - Secretaría: {meta.get('secretaria_nombre')}")
    print(f"  - Cantidad Programada: {meta.get('cantidad')} {meta.get('unidad_nombre')}")
    print(f"  - Acumulado Físico Ejecutado: {meta.get('acumulado_fisico')}")
    print(f"  - % Cumplimiento Físico: {meta.get('porcentaje_fisico')}%")
    print(f"  - Total Gasto Ejecutado: ${meta.get('total_gasto')}")
    print(f"  - % Cumplimiento Financiero: {meta.get('porcentaje_financiero')}%")
    print(f"  - Estado: {meta.get('estadoProgreso')}")
else:
    print(f"Error al consultar la meta: {meta_res.status_code} - {meta_res.text}")

# 4. Consultar Seguimiento Trimestral Detallado por Código
print(f"\n4. Consultando seguimiento trimestral por código '{CODIGO_META}'...")
seg_res = session.get(f"{API_URL}/api/metas/codigo/{CODIGO_META}/seguimiento", headers=headers, verify=False)
if seg_res.status_code == 200:
    seg_data = seg_res.json()
    print(f"✓ Desglose por trimestres ({len(seg_data.get('detalles', []))} periodos registrados):")
    for d in seg_data.get("detalles", [])[:3]:
        print(f"  * {d['anio']}-{d['trimestre']} | Prog: {d['programacion_cantidad']} | Ejec: {d['avance_cantidad']} | Gasto: ${d['avance_gastos']}")
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
  * *Estructura temporal:* `val1_*` representa el año 2024, `val2_*` el año 2025, `val3_*` el año 2026 y `val4_*` el año 2027.
* **Enfoques Diferenciales y Grupos de Población:**
  * `cantidad_0_5`: Primera Infancia (0 a 5 años).
  * `cantidad_6_12`: Infancia (6 a 12 años).
  * `cantidad_13_17`: Adolescencia (13 a 17 años).
  * `cantidad_18_24`: Juventud (18 a 24 años).
  * `cantidad_25_62`: Adultos (25 a 62 años).
  * `cantidad_65_mas`: Personas Mayores (65 años en adelante).
  * `cantesp_*`: Población de especial protección constitucional (Mujeres, Personas con Discapacidad, Grupos Étnicos, Víctimas del Conflicto Armado, Desmovilizados, Comunidad LGTBI, Migrantes, Indigentes, Personas Privadas de la Libertad).
