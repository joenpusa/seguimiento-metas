# Documentación Oficial de Integración - API de Seguimiento de Metas PDD
**Gobernación de Norte de Santander**  
**Plan de Desarrollo Departamental: "Norte Territorio de Paz" (2024-2027)**

---

## 1. Información General y Entorno de Producción

La API del sistema de seguimiento de metas está desarrollada bajo el estándar **REST**, utiliza **JSON** para el intercambio de información y autenticación mediante **JWT (JSON Web Tokens)**.

* **URL Base de la API (Producción):**  
  `https://apiseguimientopdd.nortedesantander.gov.co`
* **Aplicación Web Oficial:**  
  `https://seguimientopdd.nortedesantander.gov.co`
* **Cabeceras estándar requeridas:**  
  * `Content-Type: application/json`
  * `Authorization: Bearer <ACCESS_TOKEN>` *(requerido en todos los endpoints de consulta)*

> **Nota técnica sobre certificados SSL:**  
> Si su cliente HTTP (por ejemplo `curl`, librerías internas o entornos de desarrollo) no tiene instalada la cadena de certificados intermedia del dominio gubernamental y genera el error `SSL certificate problem: unable to get local issuer certificate` (código 60), agregue el parámetro `-k` o `--insecure` en `curl`, o deshabilite la verificación estricta de SSL en su cliente (`verify=False` en Python, `NODE_TLS_REJECT_UNAUTHORIZED="0"` en Node.js).

---

## 2. Autenticación y Obtención del Token (Login)

Para interactuar con la API desde cualquier aplicación externa, el primer paso obligatorio es autenticarse utilizando las credenciales asignadas para obtener un **token de acceso (JWT)**.

### Credenciales de Acceso
* **Usuario (email):** `apigober@nortedesantander.gov.co`
* **Contraseña:** `Pass.2026`
* **Rol asignado:** `admin` *(permite lectura y consulta global del sistema)*

---

### Endpoint: Iniciar Sesión (`POST /api/auth/login`)

* **Método:** `POST`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/auth/login`
* **Cabecera:** `Content-Type: application/json`

#### Parámetros del Body (JSON)
| Parámetro | Tipo | Obligatorio | Descripción |
| :--- | :--- | :---: | :--- |
| `email` | `string` | Sí | Correo electrónico asignado (`apigober@nortedesantander.gov.co`). |
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

> **Importante:**
> 1. El `accessToken` tiene una vigencia estándar de **8 horas**. Una vez expire, se debe realizar nuevamente la solicitud de login para renovarlo.
> 2. Cada llamada a los endpoints de metas debe incluir la cabecera:
>    ```http
>    Authorization: Bearer <accessToken>
>    ```

---

## 3. Contexto Base: Resolución Automática del Plan Activo

El sistema almacena información de metas asociadas a Planes de Desarrollo Departamentales.

> [!IMPORTANT]
> **Consulta por Código en el Plan Activo:**  
> Las aplicaciones externas **no necesitan conocer ni enviar identificadores internos** (`id_meta` ni `id_plan`).  
> 
> Como es posible que un código o número de meta pueda repetirse entre diferentes planes de desarrollo históricos, **la API entrega automáticamente los datos de la meta correspondiente al Plan de Desarrollo que está ACTIVO en el momento dentro del proyecto** (`es_activo = 1`). Actualmente corresponde al plan **"Norte Territorio de Paz" (2024-2027)**.

---

## 4. Consulta de Metas

### 4.1. Listado General de Metas del Plan Activo (`GET /api/metas`)

Permite obtener el listado completo de metas registradas en el Plan de Desarrollo activo, incluyendo sus acumulados físicos, financieros, porcentajes de avance y estado de progreso.

* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

#### Parámetros de Consulta (Query Parameters - Opcionales)
| Parámetro | Tipo | Obligatorio | Descripción | Ejemplo |
| :--- | :--- | :---: | :--- | :--- |
| `codigo` | `string` | No | Filtro exacto por el código o número de la meta. | `117` |
| `q` | `string` | No | Búsqueda por coincidencia en texto (código, nombre o descripción). | `conectados` |
| `estadoProgreso`| `string` | No | Filtro por estado: `SIN_INICIAR`, `EN_EJECUCION` o `COMPLETADA`. | `EN_EJECUCION` |
| `responsableId`| `number` | No | Filtro por ID de Secretaría ejecutora. | `2` *(Secretaría de TICs)* |
| `limit` | `string` | No | Pasar `all` para retornar la totalidad de metas sin límite de 100. | `all` |

#### Ejemplo 1: Consultar todas las metas del plan activo
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/metas?limit=all" \
  -H "Authorization: Bearer $TOKEN"
```

#### Ejemplo 2: Filtrar metas por código
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/metas?codigo=117" \
  -H "Authorization: Bearer $TOKEN"
```

#### Estructura de Respuesta (`200 OK`)
Retorna un arreglo JSON con las metas del plan activo:
```json
[
  {
    "id_meta": 12,
    "codigo": "117",
    "nombre": "Municipios y áreas no municipalizadas conectados a redes de servicio",
    "descripcion": "Municipios y áreas no municipalizadas conectados a redes de servicio",
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
    "val1_sgp": 0, "val2_sgp": 0, "val3_sgp": 0, "val4_sgp": 0,
    "val1_reg": 0, "val2_reg": 10000, "val3_reg": 5000, "val4_reg": 0,
    "val1_mun": 0, "val2_mun": 15000, "val3_mun": 15000, "val4_mun": 20000,
    "val1_cre": 0, "val2_cre": 0, "val3_cre": 0, "val4_cre": 0,
    "val1_otr": 0, "val2_otr": 0, "val3_otr": 0, "val4_otr": 0,

    "porcentaje_financiero": 49.46,
    "estadoProgreso": "COMPLETADA",

    "linea_codigo": "1",
    "linea_nombre": "DESARROLLO ECONÓMICO SOSTENIBLE Y COMPETITIVIDAD",
    "componente_codigo": "1.7",
    "componente_nombre": "TIC - CTeI",
    "apuesta_codigo": "1.7.1",
    "apuesta_nombre": "CONECTIVIDAD: Cerrando Brechas Digitales",
    "iniciativa_codigo": "1.7.1.1",
    "iniciativa_nombre": "Instalación, ampliación de cobertura, fortalecimiento...",

    "created_at": "2026-01-07T15:07:18.000Z"
  }
]
```

---

### 4.2. Consulta de Meta Específica por Código (`GET /api/metas/codigo/:codigo`)

> [!TIP]
> **Endpoint Principal de Integración:**  
> Permite obtener la ficha técnica integral de una meta mediante su **código oficial**. La API busca de forma automática la meta correspondiente en el **plan de desarrollo activo**.

* **Método:** `GET`
* **URL:** `https://apiseguimientopdd.nortedesantander.gov.co/api/metas/codigo/:codigo`
* **Cabecera:** `Authorization: Bearer <TOKEN>`

#### Parámetros de Ruta (Path Parameters)
| Parámetro | Tipo | Obligatorio | Descripción | Ejemplo |
| :--- | :--- | :---: | :--- | :--- |
| `codigo` | `string` | Sí | Código o número oficial de la meta registrado en el plan. | `117` |

#### Ejemplo en cURL
```bash
curl -k -X GET "https://apiseguimientopdd.nortedesantander.gov.co/api/metas/codigo/117" \
  -H "Authorization: Bearer $TOKEN"
```

#### Estructura de Respuesta Exitosa (`200 OK`)
Retorna el objeto meta con desglose acumulado de cantidades, gastos por fuente y distribución territorial:
```json
{
  "id_meta": 12,
  "codigo": "117",
  "nombre": "Municipios y áreas no municipalizadas conectados a redes de servicio",
  "descripcion": "Municipios y áreas no municipalizadas conectados a redes de servicio",
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
  "val1_sgp": 0, "val2_sgp": 0, "val3_sgp": 0, "val4_sgp": 0,
  "val1_reg": 0, "val2_reg": 10000, "val3_reg": 5000, "val4_reg": 0,
  "val1_mun": 0, "val2_mun": 15000, "val3_mun": 15000, "val4_mun": 20000,
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
```json
{
  "message": "Meta con código '999' no encontrada en el plan de desarrollo activo"
}
```

---

### 4.3. Consulta de Seguimiento Trimestral por Código (`GET /api/metas/codigo/:codigo/seguimiento`)

Permite contrastar cronológicamente lo **programado vs. ejecutado** (físico y financiero) trimestre a trimestre (T1, T2, T3, T4) para una meta consultada por su código en el plan activo.

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
    "unidad_nombre": "Municipios"
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
      "avance_cantidad": 21,
      "avance_gastos": 32173.7,
      "porcentaje_cumplimiento_fisico": 100,
      "porcentaje_cumplimiento_financiero": 49.46,
      "poblacion_total_reportada": 49362
    }
  ]
}
```

---

## 5. Scripts y Ejemplos de Conexión de Extremo a Extremo

A continuación se presentan los ejemplos completos que realizan el flujo estándar de integración:
1. **Autenticación (Login):** Envía usuario y contraseña y obtiene el `accessToken`.
2. **Listado de Metas:** Consulta el listado general del plan activo.
3. **Consulta por Código:** Obtiene la ficha de la meta específica por su número/código.
4. **Seguimiento Trimestral:** Obtiene el reporte de ejecución programada vs. real por períodos.

---

### 5.1. Script en Bash (Linux / macOS)

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

# Extraer el token de acceso JWT
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
curl -k -s -X GET "${API_URL}/api/metas" \
  -H "Authorization: Bearer ${TOKEN}" | head -n 30

echo ""
echo "=========================================================="
echo "3. Consultando meta específica por Código (${CODIGO_META})..."
echo "=========================================================="
curl -k -s -X GET "${API_URL}/api/metas/codigo/${CODIGO_META}" \
  -H "Authorization: Bearer ${TOKEN}" | head -n 35

echo ""
echo "=========================================================="
echo "4. Consultando seguimiento trimestral por Código (${CODIGO_META})..."
echo "=========================================================="
curl -k -s -X GET "${API_URL}/api/metas/codigo/${CODIGO_META}/seguimiento" \
  -H "Authorization: Bearer ${TOKEN}" | head -n 35

echo -e "\nFlujo completado exitosamente."
```

---

### 5.2. Ejemplo en Node.js (JavaScript / Fetch)

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
  console.log("✓ Token JWT obtenido exitosamente.");

  const headers = {
    "Authorization": `Bearer ${token}`
  };

  // 2. Listar Metas del Plan Activo (sin requerir idPlan)
  console.log("\n2. Consultando listado de metas del plan activo...");
  const metasRes = await fetch(`${API_URL}/api/metas`, { headers });
  const metas = await metasRes.json();
  console.log(`✓ Se obtuvieron ${metas.length} metas del plan activo.`);

  // 3. Consultar Meta Específica por Código en el Plan Activo
  console.log(`\n3. Consultando meta con código '${CODIGO_META}'...`);
  const metaRes = await fetch(`${API_URL}/api/metas/codigo/${CODIGO_META}`, { headers });
  
  if (metaRes.ok) {
    const meta = await metaRes.json();
    console.log("✓ Meta encontrada:");
    console.log(`  - Código: ${meta.codigo}`);
    console.log(`  - Nombre: ${meta.nombre}`);
    console.log(`  - Plan Activo: [${meta.id_plan}] ${meta.nombre_plan}`);
    console.log(`  - Secretaría: ${meta.secretaria_nombre}`);
    console.log(`  - Cantidad Programada: ${meta.cantidad} ${meta.unidad_nombre}`);
    console.log(`  - Acumulado Físico Ejecutado: ${meta.acumulado_fisico}`);
    console.log(`  - % Cumplimiento Físico: ${meta.porcentaje_fisico}%`);
    console.log(`  - Total Gasto Ejecutado: $${meta.total_gasto}`);
    console.log(`  - % Cumplimiento Financiero: ${meta.porcentaje_financiero}%`);
    console.log(`  - Estado: ${meta.estadoProgreso}`);
  } else {
    console.error(`Meta no encontrada (${metaRes.status})`);
  }

  // 4. Consultar Seguimiento Trimestral Detallado por Código
  console.log(`\n4. Consultando desglose trimestral para '${CODIGO_META}'...`);
  const segRes = await fetch(`${API_URL}/api/metas/codigo/${CODIGO_META}/seguimiento`, { headers });
  if (segRes.ok) {
    const seguimiento = await segRes.json();
    console.log(`✓ Trimestres con seguimiento reportado: ${seguimiento.detalles.length}`);
  }
}

integracionMetas().catch(console.error);
```

---

### 5.3. Ejemplo en Python (`requests`)

```python
import requests

API_URL = "https://apiseguimientopdd.nortedesantander.gov.co"
CODIGO_META = "117"

# 1. Login y Obtención del Token
print("1. Autenticando en la API...")
login_payload = {
    "email": "apigober@nortedesantander.gov.co",
    "password": "Pass.2026"
}

session = requests.Session()
# Nota: verify=False si el cliente no valida el certificado intermedio del dominio gubernamental
res = session.post(f"{API_URL}/api/auth/login", json=login_payload, verify=False)
res.raise_for_status()

token = res.json()["accessToken"]
print("✓ Autenticado con éxito. Token recibido.")

headers = {
    "Authorization": f"Bearer {token}"
}

# 2. Listar Metas del Plan Activo
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
    print("✓ Ficha técnica de la meta:")
    print(f"  - Código: {meta.get('codigo')}")
    print(f"  - Nombre: {meta.get('nombre')}")
    print(f"  - Plan Activo: [{meta.get('id_plan')}] {meta.get('nombre_plan')}")
    print(f"  - Secretaría: {meta.get('secretaria_nombre')}")
    print(f"  - Cantidad Programada: {meta.get('cantidad')} {meta.get('unidad_nombre')}")
    print(f"  - Acumulado Físico Ejecutado: {meta.get('acumulado_fisico')}")
    print(f"  - % Cumplimiento Físico: {meta.get('porcentaje_fisico')}%")
    print(f"  - Total Gasto Ejecutado: ${meta.get('total_gasto')}")
    print(f"  - % Cumplimiento Financiero: {meta.get('porcentaje_financiero')}%")
    print(f"  - Estado de Progreso: {meta.get('estadoProgreso')}")
else:
    print(f"Meta no encontrada: {meta_res.status_code} - {meta_res.text}")

# 4. Consultar Seguimiento Trimestral Detallado por Código
print(f"\n4. Consultando seguimiento trimestral por código '{CODIGO_META}'...")
seg_res = session.get(f"{API_URL}/api/metas/codigo/{CODIGO_META}/seguimiento", headers=headers, verify=False)
if seg_res.status_code == 200:
    seg_data = seg_res.json()
    detalles = seg_data.get("detalles", [])
    print(f"✓ Períodos reportados: {len(detalles)}")
    for d in detalles[:3]:
        print(f"  * {d['anio']} {d['trimestre']} | Prog: {d['programacion_cantidad']} | Avance: {d['avance_cantidad']} | Gasto: ${d['avance_gastos']}")
```

---

## 6. Glosario de Campos Financieros, Poblacionales y Estados

* **Fuentes de Financiación:**
  * `pro`: Recursos Propios del Departamento.
  * `sgp`: Sistema General de Participaciones.
  * `reg`: Sistema General de Regalías.
  * `cre`: Recursos del Crédito.
  * `mun`: Aportes de Municipios.
  * `otr`: Otras fuentes de financiación / Cooperación internacional.
  * *Estructura multianual:* `val1_*` representa el año 2024, `val2_*` el año 2025, `val3_*` el año 2026 y `val4_*` el año 2027.
* **Estados de Progreso de la Meta:**
  * `SIN_INICIAR`: La meta no cuenta con avance físico reportado a la fecha.
  * `EN_EJECUCION`: La meta presenta avances físicos reportados mayores a 0 y menores al 100%.
  * `COMPLETADA`: La meta alcanzó o superó el 100% de la cantidad física total programada.
* **Enfoques Diferenciales y Grupos de Población:**
  * `cantidad_0_5`: Primera Infancia (0 a 5 años).
  * `cantidad_6_12`: Infancia (6 a 12 años).
  * `cantidad_13_17`: Adolescencia (13 a 17 años).
  * `cantidad_18_24`: Juventud (18 a 24 años).
  * `cantidad_25_62`: Adultos (25 a 62 años).
  * `cantidad_65_mas`: Personas Mayores (65 años en adelante).
  * `cantesp_*`: Población de especial protección constitucional (Mujeres, Personas con Discapacidad, Grupos Étnicos, Víctimas del Conflicto Armado, Desmovilizados, Comunidad LGTBI, Migrantes, Indigentes, Personas Privadas de la Libertad).
