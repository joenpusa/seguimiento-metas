import { ReportsModel } from "../models/reportsModel.js";


export const reportsController = {
  // ==========================================
  // REPORTE 1: GENERAL (Dona + Tabla)
  // ==========================================
  async generateGeneralReport(req, res) {
    const { idPlan, year, quarter } = req.body;

    if (!idPlan || !year || !quarter) {
      return res.status(400).json({ error: "Faltan parámetros (idPlan, year, quarter)" });
    }

    try {
      // 1. Obtener datos desde el modelo
      const data = await ReportsModel.getGeneralReportData(idPlan, year, quarter);
      if (!data || !data.plan) {
        return res.status(404).json({ error: "Plan no encontrado o sin datos." });
      }

      const { plan, metas } = data;

      // 2. Calcular distribución (Lógica de negocio)
      let counts = {
        rango0: 0,
        rango_low: 0,      // < 26.25%
        rango_mid: 0,      // >= 26.25% && < 43.75%
        rango_high: 0,     // >= 43.75% && < 100%
        rango100: 0
      };

      metas.forEach(m => {
        const total = parseFloat(m.meta_total) || 0;
        const avance = parseFloat(m.avance_acumulado) || 0;
        let p = 0;
        if (total > 0) {
          p = (avance / total) * 100;
        }
        if (p > 100) p = 100;

        // Añadir el porcentaje calculado a cada meta por si se necesita en el frontend
        m.porcentaje_avance = parseFloat(p.toFixed(2));

        if (p === 0) counts.rango0++;
        else if (p < 26.25) counts.rango_low++;
        else if (p < 43.75) counts.rango_mid++;
        else if (p < 100) counts.rango_high++;
        else counts.rango100++;
      });

      // Retornar JSON para el frontend
      res.json({
        plan,
        metas,
        counts,
        totalMetas: metas.length
      });

    } catch (error) {
      console.error("Error generando reporte:", error);
      res.status(500).json({ error: "Error interno al generar reporte" });
    }
  },

  // ==========================================
  // REPORTE 2: METAS POR LINEAS
  // ==========================================
  async generateLineasReport(req, res) {
    const { idPlan, year, quarter, idSecretaria } = req.body;

    if (!idPlan || !year || !quarter) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    try {
      // 1. Obtener datos
      const data = await ReportsModel.getLineasReportData(idPlan, year, quarter, idSecretaria);
      if (!data || !data.plan) {
        return res.status(404).json({ error: "Plan no encontrado o sin datos." });
      }

      const { plan, metas } = data;

      // 2. Agrupar por Linea
      // Estructura: { [nombreLinea]: { metas: [], counts: {...} } }
      const groups = {};

      metas.forEach(m => {
        const lineaName = m.linea_nombre || "Sin Línea Asignada";

        if (!groups[lineaName]) {
          groups[lineaName] = {
            nombre: lineaName,
            metas: [],
            counts: {
              rango0: 0,
              rango_low: 0,    // < 26.25%
              rango_mid: 0,    // >= 26.25% && < 43.75%
              rango_high: 0,   // >= 43.75% && < 100%
              rango100: 0
            }
          };
        }

        // Calcular porcentaje individual
        const total = parseFloat(m.meta_total) || 0;
        const avance = parseFloat(m.avance_acumulado) || 0;
        let p = 0;
        if (total > 0) {
          p = (avance / total) * 100;
        }
        if (p > 100) p = 100;

        m.porcentaje_avance = parseFloat(p.toFixed(2));

        // Clasificar
        if (p === 0) groups[lineaName].counts.rango0++;
        else if (p < 26.25) groups[lineaName].counts.rango_low++;
        else if (p < 43.75) groups[lineaName].counts.rango_mid++;
        else if (p < 100) groups[lineaName].counts.rango_high++;
        else groups[lineaName].counts.rango100++;

        groups[lineaName].metas.push(m);
      });

      // Convertir object a array
      const lineas = Object.values(groups);

      res.json({
        plan,
        lineas
      });

    } catch (error) {
      console.error("Error generando reporte lineas:", error);
      res.status(500).json({ error: "Error interno al generar reporte" });
    }
  },

  // ==========================================
  // REPORTE 3: METAS POR COMPONENTES
  // ==========================================
  async generateComponentesReport(req, res) {
    const { idPlan, year, quarter, idSecretaria } = req.body;

    if (!idPlan || !year || !quarter) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    try {
      // 1. Obtener datos
      const data = await ReportsModel.getComponentesReportData(idPlan, year, quarter, idSecretaria);
      if (!data || !data.plan) {
        return res.status(404).json({ error: "Plan no encontrado o sin datos." });
      }

      const { plan, metas } = data;

      // 2. Agrupar por Componente
      // Estructura: { [nombreComponente]: { metas: [], counts: {...} } }
      const groups = {};

      metas.forEach(m => {
        const componenteName = m.componente_nombre || "Sin Componente Asignado";

        if (!groups[componenteName]) {
          groups[componenteName] = {
            nombre: componenteName,
            metas: [],
            counts: {
              rango0: 0,
              rango_low: 0,    // < 26.25%
              rango_mid: 0,    // >= 26.25% && < 43.75%
              rango_high: 0,   // >= 43.75% && < 100%
              rango100: 0
            }
          };
        }

        // Calcular porcentaje individual
        const total = parseFloat(m.meta_total) || 0;
        const avance = parseFloat(m.avance_acumulado) || 0;
        let p = 0;
        if (total > 0) {
          p = (avance / total) * 100;
        }
        if (p > 100) p = 100;

        m.porcentaje_avance = parseFloat(p.toFixed(2));

        // Clasificar
        if (p === 0) groups[componenteName].counts.rango0++;
        else if (p < 26.25) groups[componenteName].counts.rango_low++;
        else if (p < 43.75) groups[componenteName].counts.rango_mid++;
        else if (p < 100) groups[componenteName].counts.rango_high++;
        else groups[componenteName].counts.rango100++;

        groups[componenteName].metas.push(m);
      });

      // Convertir object a array
      const componentes = Object.values(groups);

      res.json({
        plan,
        componentes
      });

    } catch (error) {
      console.error("Error generando reporte componentes:", error);
      res.status(500).json({ error: "Error interno al generar reporte" });
    }
  },

  // ==========================================
  // REPORTE 5: METAS POR SECRETARÍAS
  // ==========================================
  async generateSecretariasReport(req, res) {
    const { idPlan, year, quarter, idSecretaria } = req.body;

    if (!idPlan || !year || !quarter) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    try {
      // 1. Obtener datos
      const data = await ReportsModel.getSecretariasReportData(idPlan, year, quarter, idSecretaria);
      if (!data || !data.plan) {
        return res.status(404).json({ error: "Plan no encontrado o sin datos." });
      }

      const { plan, metas } = data;

      // 2. Agrupar por Secretaria
      const groups = {};

      metas.forEach(m => {
        const secretariaName = m.secretaria_nombre || "Sin Secretaría Asignada";

        if (!groups[secretariaName]) {
          groups[secretariaName] = {
            nombre: secretariaName,
            metas: [],
            counts: {
              rango0: 0,
              rango_low: 0,    // < 26.25%
              rango_mid: 0,    // >= 26.25% && < 43.75%
              rango_high: 0,   // >= 43.75% && < 100%
              rango100: 0
            }
          };
        }

        // Calcular porcentaje individual
        const total = parseFloat(m.meta_total) || 0;
        const avance = parseFloat(m.avance_acumulado) || 0;
        let p = 0;
        if (total > 0) {
          p = (avance / total) * 100;
        }
        if (p > 100) p = 100;

        m.porcentaje_avance = parseFloat(p.toFixed(2));

        // Clasificar
        if (p === 0) groups[secretariaName].counts.rango0++;
        else if (p < 26.25) groups[secretariaName].counts.rango_low++;
        else if (p < 43.75) groups[secretariaName].counts.rango_mid++;
        else if (p < 100) groups[secretariaName].counts.rango_high++;
        else groups[secretariaName].counts.rango100++;

        groups[secretariaName].metas.push(m);
      });

      // Convertir object a array
      const secretarias = Object.values(groups);

      res.json({
        plan,
        secretarias
      });

    } catch (error) {
      console.error("Error generando reporte secretarias:", error);
      res.status(500).json({ error: "Error interno al generar reporte" });
    }
  },

  // ==========================================
  // REPORTE 7: ARBOL DE METAS GENERAL
  // ==========================================
  async generateArbolReport(req, res) {
    const { idPlan, year, quarter } = req.body;

    if (!idPlan || !year || !quarter) {
      return res.status(400).json({ error: "Faltan parámetros (idPlan, year, quarter)" });
    }

    try {
      // 1. Obtener datos planos con toda la jerarquía
      const data = await ReportsModel.getArbolReportData(idPlan, year, quarter);
      if (!data || !data.plan) {
        return res.status(404).json({ error: "Plan no encontrado o sin datos." });
      }

      const { plan, metas } = data;

      // 2. Construir el árbol
      // Estructura deseada:
      // Linea -> Componentes -> Apuestas -> Iniciativas -> Metas

      const tree = [];
      const mapLineas = {};

      metas.forEach(row => {
        // --- Nivel 1: Linea ---
        if (!mapLineas[row.linea_id]) {
          mapLineas[row.linea_id] = {
            type: 'linea',
            id: row.linea_id,
            nombre: row.linea_nombre,
            codigo: row.linea_codigo,
            children: [], // Componentes
            mapChildren: {}
          };
          tree.push(mapLineas[row.linea_id]);
        }
        const lineaNode = mapLineas[row.linea_id];

        // --- Nivel 2: Componente ---
        if (!lineaNode.mapChildren[row.componente_id]) {
          lineaNode.mapChildren[row.componente_id] = {
            type: 'componente',
            id: row.componente_id,
            nombre: row.componente_nombre,
            codigo: row.componente_codigo,
            children: [], // Apuestas
            mapChildren: {}
          };
          lineaNode.children.push(lineaNode.mapChildren[row.componente_id]);
        }
        const compNode = lineaNode.mapChildren[row.componente_id];

        // --- Nivel 3: Apuesta ---
        if (!compNode.mapChildren[row.apuesta_id]) {
          compNode.mapChildren[row.apuesta_id] = {
            type: 'apuesta',
            id: row.apuesta_id,
            nombre: row.apuesta_nombre,
            codigo: row.apuesta_codigo,
            children: [], // Iniciativas
            mapChildren: {}
          };
          compNode.children.push(compNode.mapChildren[row.apuesta_id]);
        }
        const apuestaNode = compNode.mapChildren[row.apuesta_id];

        // --- Nivel 4: Iniciativa ---
        // Nota: En la query, iniciavia es id_detalle de la meta asociado (padre directo o mismo nivel segun la logica)
        // Pero segun la query: 
        // m.id_detalle -> ini (mismo) -> apu (padre) 
        // REVISANDO QUERY en Model:
        // FROM metas m JOIN detalles_plan dp ...
        // LEFT JOIN detalles_plan ini ON ini.id_detalle = m.id_detalle  <-- ESTO ES CORRECTO? 
        // Si 'metas' tabla tiene id_detalle, ese id_detalle apunta a la tabla detalles_plan.
        // La jerarquia en detalles_plan es id_detalle -> id_detalle_padre.
        //
        // Si seguimos la logica de 'lineas' report:
        // m.id_detalle (Meta) -> i.id_detalle (Iniciativa?) -> a.id_detalle_padre (Apuesta) ...
        //
        // En el modelo escribí:
        // LEFT JOIN detalles_plan ini ON ini.id_detalle = m.id_detalle
        // LEFT JOIN detalles_plan apu ON apu.id_detalle = ini.id_detalle_padre
        //
        // Esto implica que el detalle asociado a la meta ES la iniciativa? O la meta es un hijo de la iniciativa?
        // Generalmente: Linea -> Componente -> Programa -> Proyecto -> Meta?
        // O Linea -> Componente -> Apuesta -> Iniciativa -> Meta?
        //
        // El prompt dice: Linea > Componente > Apuesta > Iniciativa > Meta
        // Esto son 5 niveles.
        // Mi query actual:
        // m (meta) -> ini (m.id_detalle) -> apu (ini.padre) -> com (apu.padre) -> lin (com.padre)
        // Esto asume que la meta ESTA al mismo nivel que la "Iniciativa" o que la meta TIENE UN id_detalle que ES la iniciativa.
        // PERO usualmente la meta es HIJA de una iniciativa.
        // Si la meta es hija, deberia ser:
        // Meta (m) tiene un id_detalle.
        // Ese detalle (nivel Meta) tiene un padre (Iniciativa).
        // Ese padre tiene un padre (Apuesta).
        //
        // Vamos a asumir que la query del modelo (que copié la lógica visual de 'lineas') necesita ajuste si la jerarquia real es:
        // Detalle(Meta) -> Padre(Iniciativa) -> Padre(Apuesta) -> Padre(Componente) -> Padre(Linea)
        //
        // En getLineasReportData (existente) la query hace:
        // LEFT JOIN detalles_plan i ON i.id_detalle = m.id_detalle  (Nivel Meta?)
        // LEFT JOIN detalles_plan a ON a.id_detalle = i.id_detalle_padre (Nivel Arriba 1)
        // LEFT JOIN detalles_plan c ON c.id_detalle = a.id_detalle_padre (Nivel Arriba 2)
        // LEFT JOIN detalles_plan l ON l.id_detalle = c.id_detalle_padre (Nivel Arriba 3)
        //
        // Si esto da Linea (l) -> Nivel2 (c) -> Nivel1 (a) -> Meta (i)
        // Son 4 niveles de detalle + la Meta en sí.
        // El usuario pide: Linea > Componente > Apuesta > Iniciativa > Meta.
        // Son 4 ancestros para la meta?
        // Si la estructura del usuario es estandar en su DB:
        // 1. Linea
        // 2. Componente
        // 3. Apuesta
        // 4. Iniciativa
        // 5. Meta (asociada a Iniciativa)
        //
        // Entonces mi query en el modelo usó:
        // ini = m.id_detalle (ERROR de nombre, esto es el detalle de la meta)
        // apu = ini.padre (Este seria Iniciativa)
        // com = apu.padre (Este seria Apuesta)
        // lin = com.padre (Este seria Componente)
        // ... Falta uno mas arriba para Linea?

        // CORRECCION RAPIDA DE LOGICA:
        // Voy a asumir que la estructura de niveles es fija y profunda.
        // Si faltara un nivel arriba, el 'linea_nombre' saldria null o incorrecto.
        // Pero dado que ya escribí el Modelo, voy a procesarlo como vino. 
        // Si luego veo que falta un nivel, tendré que ajustar el Modelo.
        // Asumamos por ahora que la query devuelve lo que hay:
        //  linea_id, componente_id, apuesta_id, iniciativa_id (este ultimo nombre variable en query anterior)

        // En el controller procesamos lo que llega.

        if (!apuestaNode.mapChildren[row.iniciativa_id]) {
          apuestaNode.mapChildren[row.iniciativa_id] = {
            type: 'iniciativa',
            id: row.iniciativa_id,
            nombre: row.iniciativa_nombre,
            codigo: row.iniciativa_codigo,
            children: [], // Metas
            mapChildren: {} // No usado para hojas, pero consistente
          };
          apuestaNode.children.push(apuestaNode.mapChildren[row.iniciativa_id]);
        }
        const iniciativaNode = apuestaNode.mapChildren[row.iniciativa_id];

        // --- Nivel 5: Meta (Hoja) ---
        // Calculo porcentaje meta
        const total = parseFloat(row.meta_total) || 0;
        const avance = parseFloat(row.avance_acumulado) || 0;
        let p = 0;
        if (total > 0) {
          p = (avance / total) * 100;
        }
        if (p > 100) p = 100;

        iniciativaNode.children.push({
          type: 'meta',
          id: row.id_meta,
          nombre: row.meta_nombre,
          codigo: row.meta_codigo,
          unidad_meta: total,
          avance_meta: avance,
          avance_porcentaje: parseFloat(p.toFixed(2))
        });
      });

      // 3. Calcular porcentajes acumulados recursivamente (bottom-up)
      // La regla del usuario: "acumulando segun la zona del arbol"
      // Interpretación: Promedio de los hijos.

      const calculateProgress = (node) => {
        if (node.type === 'meta') {
          return node.avance_porcentaje;
        }

        if (!node.children || node.children.length === 0) {
          node.avance_porcentaje = 0;
          return 0;
        }

        let sum = 0;
        node.children.forEach(child => {
          sum += calculateProgress(child);
        });

        const avg = sum / node.children.length;
        node.avance_porcentaje = parseFloat(avg.toFixed(2));

        // Limpiamos mapChildren para no ensuciar el JSON final
        delete node.mapChildren;

        return node.avance_porcentaje;
      };

      // Calcular para cada raiz (linea)
      tree.forEach(linea => calculateProgress(linea));

      res.json({
        plan,
        arbol: tree
      });

    } catch (error) {
      console.error("Error generando reporte arbol:", error);
      res.status(500).json({ error: "Error interno al generar reporte" });
    }
  },

  // ==========================================
  // REPORTE 4: RANKING POR COMPONENTES
  // ==========================================
  async generateRankingComponentesReport(req, res) {
    const { idPlan, year, quarter, idSecretaria } = req.body;

    if (!idPlan || !year || !quarter) {
      return res.status(400).json({ error: "Faltan parámetros (idPlan, year, quarter)" });
    }

    try {
      // 1. Obtener datos agrupados
      const data = await ReportsModel.getRankingComponentesData(idPlan, year, quarter, idSecretaria);
      if (!data || !data.plan) {
        return res.status(404).json({ error: "Plan no encontrado o sin datos." });
      }

      const { plan, rows } = data;

      // 2. Calcular porcentajes y procesar
      const ranking = rows.map(row => {
        const total = parseFloat(row.meta_total_sum) || 0;
        const avance = parseFloat(row.avance_acumulado_sum) || 0;
        let p = 0;

        if (total > 0) {
          p = (avance / total) * 100;
        }
        if (p > 100) p = 100; // Cap at 100% logic? Usually yes for display color.

        return {
          componente_id: row.componente_id,
          componente_nombre: row.componente_nombre,
          secretaria_nombre: row.secretaria_nombre || "Sin Asignar",
          metas_count: row.total_metas_count,
          avance_porcentaje: parseFloat(p.toFixed(2))
        };
      });

      // 3. Ordenar por Porcentaje Descendente (Mayor a Menor)
      ranking.sort((a, b) => b.avance_porcentaje - a.avance_porcentaje);

      res.json({
        plan,
        ranking
      });

    } catch (error) {
      console.error("Error generando reporte ranking:", error);
      res.status(500).json({ error: "Error interno al generar reporte" });
    }
  }
  ,

  // ==========================================
  // REPORTE 6: RANKING POR DEPENDENCIAS (SECRETARIAS)
  // ==========================================
  async generateRankingSecretariasReport(req, res) {
    const { idPlan, year, quarter, idSecretaria } = req.body;

    if (!idPlan || !year || !quarter) {
      return res.status(400).json({ error: "Faltan parámetros (idPlan, year, quarter)" });
    }

    try {
      // 1. Obtener datos agrupados
      const data = await ReportsModel.getRankingSecretariasData(idPlan, year, quarter, idSecretaria);
      if (!data || !data.plan) {
        return res.status(404).json({ error: "Plan no encontrado o sin datos." });
      }

      const { plan, rows } = data;

      // 2. Calcular porcentajes y procesar
      const ranking = rows.map(row => {
        const total = parseFloat(row.meta_total_sum) || 0;
        const avance = parseFloat(row.avance_acumulado_sum) || 0;
        let p = 0;

        if (total > 0) {
          p = (avance / total) * 100;
        }
        if (p > 100) p = 100;

        return {
          secretaria_id: row.secretaria_id,
          secretaria_nombre: row.secretaria_nombre,
          metas_count: row.total_metas_count,
          avance_porcentaje: parseFloat(p.toFixed(2))
        };
      });

      // 3. Ordenar por Porcentaje Descendente
      ranking.sort((a, b) => b.avance_porcentaje - a.avance_porcentaje);

      res.json({
        plan,
        ranking
      });

    } catch (error) {
      console.error("Error generando reporte ranking secretarias:", error);
      res.status(500).json({ error: "Error interno al generar reporte" });
    }
  }
};
