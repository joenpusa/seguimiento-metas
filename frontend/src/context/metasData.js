import { v4 as uuidv4 } from 'uuid';

export const initialMetasData = []; 

export const planDesarrolloEstructura = {
  lineasEstrategicas: [
    { 
      id: uuidv4(),
      nombre: 'Línea Estratégica Ejemplo 1',
      componentes: [
        {
          id: uuidv4(),
          nombre: 'Componente Ejemplo 1.1',
          apuestas: [
            {
              id: uuidv4(),
              nombre: 'Apuesta Ejemplo 1.1.1',
              iniciativas: [
                { 
                  id: uuidv4(),
                  nombre: 'Iniciativa Ejemplo 1.1.1.1',
                  metas: [
                    {
                      idMeta: uuidv4(),
                      numeroMetaManual: "M1",
                      nombreMeta: "Meta Ejemplo 1",
                      descripcionMeta: "Descripción de la meta ejemplo 1",
                      cantidad: 100,
                      unidadMedida: "Unidades",
                      responsable: "Secretaría General",
                      fechaLimite: "2025-12-31",
                      municipios: ["Todo el departamento"],
                      presupuestoAnual: [
                        { anio: 1, valor: 10000 },
                        { anio: 2, valor: 15000 },
                        { anio: 3, valor: 12000 },
                        { anio: 4, valor: 13000 },
                      ],
                      progreso: 0,
                      progresoFinanciero: 0,
                      avances: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const municipiosDepartamentales = [
  "Todo el departamento", "Municipio Alpha", "Municipio Beta", "Municipio Gamma"
];

export const responsables = [
  { id: uuidv4(), nombre: 'Secretaría General' },
  { id: uuidv4(), nombre: 'Oficina de Planeación' },
  { id: uuidv4(), nombre: 'Despacho del Alcalde/Gobernador' },
];

export const unidadesMedida = [
  { id: uuidv4(), nombre: 'Porcentaje' },
  { id: uuidv4(), nombre: 'Unidades' },
  { id: uuidv4(), nombre: 'Personas' },
  { id: uuidv4(), nombre: 'Kilómetros' },
  { id: uuidv4(), nombre: 'Hectáreas' },
  { id: uuidv4(), nombre: 'Informes' },
  { id: uuidv4(), nombre: 'Eventos' },
];