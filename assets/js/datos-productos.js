/* ==========================================================
   Datos simulados del catálogo (Parte 1).
   Los campos coinciden con la tabla "producto" de la Parte 2,
   para poder sustituir este archivo por datos del servidor.
   ========================================================== */
const CATEGORIAS = {
  "virgen-extra": "Virgen extra",
  "ecologico": "Ecológico",
  "temprano": "Cosecha temprana"
};

const PRODUCTOS = [
  { id: 1, categoria: "virgen-extra", nombre: "Picual Sierra Sur", productor: "Almazara Sierra Sur", origen: "Jaén", variedad: "Picual", formato_ml: 500, precio: 8.90, stock: 24, imagen: "assets/img/aceite.svg", descripcion: "Aceite intenso y frutado, con notas de hierba recién cortada y un final ligeramente picante." },
  { id: 2, categoria: "virgen-extra", nombre: "Arbequina Dulce", productor: "Olivares del Ebro", origen: "Lleida", variedad: "Arbequina", formato_ml: 500, precio: 9.50, stock: 18, imagen: "assets/img/aceite.svg", descripcion: "Aceite suave y equilibrado, con aroma a fruta madura y almendra. Ideal para ensaladas y pescados." },
  { id: 3, categoria: "virgen-extra", nombre: "Hojiblanca Reserva", productor: "Cooperativa Vega Alta", origen: "Córdoba", variedad: "Hojiblanca", formato_ml: 750, precio: 12.90, stock: 12, imagen: "assets/img/aceite.svg", descripcion: "Aceite complejo, de amargor y picor medios, con recuerdos a tomate verde y alcachofa." },
  { id: 4, categoria: "virgen-extra", nombre: "Cornicabra Tradición", productor: "Finca Los Montes", origen: "Toledo", variedad: "Cornicabra", formato_ml: 500, precio: 10.20, stock: 0, imagen: "assets/img/aceite.svg", descripcion: "Aceite de gran estabilidad y sabor profundo, muy apreciado para cocinar y para aliñar." },
  { id: 5, categoria: "ecologico", nombre: "Picual Ecológico", productor: "Huerta Verde Eco", origen: "Jaén", variedad: "Picual", formato_ml: 500, precio: 11.50, stock: 30, imagen: "assets/img/aceite.svg", descripcion: "Aceite de cultivo ecológico, con carácter y un toque amargo equilibrado." },
  { id: 6, categoria: "ecologico", nombre: "Arbequina Ecológico", productor: "Olivar Sostenible", origen: "Tarragona", variedad: "Arbequina", formato_ml: 250, precio: 6.80, stock: 40, imagen: "assets/img/aceite.svg", descripcion: "Formato pequeño de aceite ecológico, dulce y fluido. Perfecto para probar." },
  { id: 7, categoria: "ecologico", nombre: "Empeltre Bio", productor: "Almazara del Bajo Aragón", origen: "Teruel", variedad: "Empeltre", formato_ml: 750, precio: 13.40, stock: 9, imagen: "assets/img/aceite.svg", descripcion: "Aceite ecológico de sabor suave y aroma a fruta madura, típico del Bajo Aragón." },
  { id: 8, categoria: "ecologico", nombre: "Hojiblanca Ecológico (garrafa)", productor: "Vega Alta Eco", origen: "Córdoba", variedad: "Hojiblanca", formato_ml: 5000, precio: 49.90, stock: 5, imagen: "assets/img/aceite.svg", descripcion: "Garrafa de 5 litros de aceite ecológico para el consumo diario de toda la familia." },
  { id: 9, categoria: "temprano", nombre: "Picual Cosecha Temprana", productor: "Almazara Sierra Sur", origen: "Jaén", variedad: "Picual", formato_ml: 500, precio: 14.90, stock: 15, imagen: "assets/img/aceite.svg", descripcion: "Aceituna recogida en septiembre: verde, intenso y con mucho polifenol." },
  { id: 10, categoria: "temprano", nombre: "Arbequina Temprano", productor: "Olivares del Ebro", origen: "Lleida", variedad: "Arbequina", formato_ml: 250, precio: 8.50, stock: 3, imagen: "assets/img/aceite.svg", descripcion: "Cosecha temprana de arbequina, fresca y herbácea. Quedan pocas unidades." },
  { id: 11, categoria: "temprano", nombre: "Picudo Temprano", productor: "Finca La Subbética", origen: "Córdoba", variedad: "Picudo", formato_ml: 500, precio: 15.90, stock: 11, imagen: "assets/img/aceite.svg", descripcion: "Aceite aromático y elegante, con notas florales y un amargor muy suave." },
  { id: 12, categoria: "temprano", nombre: "Royal Temprano", productor: "Almazara Sierra de Segura", origen: "Jaén", variedad: "Royal", formato_ml: 750, precio: 18.50, stock: 7, imagen: "assets/img/aceite.svg", descripcion: "Variedad poco común, de aroma limpio y sabor equilibrado entre dulce y picante." }
];
