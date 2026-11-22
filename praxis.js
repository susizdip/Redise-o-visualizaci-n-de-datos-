/*
*-----------------------------------------------------
 * VISUALIZACIÓN INTERACTIVA DE DATOS
 * ¡Al agua, patos!
 *
 * Biblioteca: p5.js (JavaScript)
 * Datos: archivo CSV para la PEC3
 *
 * El programa representa la evolución temporal de ocho
 * categorías de vasos de piscina entre 2015 y 2022.
 *
 * Funcionalidades:
 * Gráficos individuales (small multiples).
 * Escalas verticales adaptadas a cada categoría.
 * Consulta de valores mediante etiquetas emergentes.
 * Ampliación de gráficos.
 * Selección y comparación de dos categorías.

 * susana izquierdo ruiz
*-----------------------------------------------------
 */

// Tabla que almacenara los datos importados del CSV.

//---------------------------------------
// A. Variables generales y carga de datos
//---------------------------------------

let registros;

// Dimensiones del lienzo gráfico, expresadas en pixeles
const ANCHO = 350;
const ALTO = 175;

// Márgenes interiores reservados para ejes y etiquetas.
const M = {
  izquierda: 48,
  derecha: 12,
  arriba: 18,
  abajo: 34
};

/*
 * preload()
 * Carga el archivo CSV antess de ejecutar setup()
 *
 * "csv": indicas el formato del archivo.
 * "header": utiliza la primera fila como nombres
 * de las columnas: Tipo de vaso, Año y Total
 */

function preload() {
  registros = loadTable(
    "material/datos_piscinas.csv",
    "csv",
    "header"
  );
}

//---------------------------------------------------------
// B. Preparación de categorías y creación de la interfaz
//----------------------------------------------------------
// esturctura tipica tb en processing
/*
 * setup()
 * se ejecuta una vez, después de cargar los datos
 * organiza las categorías y construye la interfaz
 */

function setup() {
  // no se crea un lienzo globale
  // cada grafico tendrá su propio canvas
  noCanvas();

  // tipos de vasos presentes en el gráfico
  const categorias = [
    "Chapoteo",
    "Polivalente",
    "Recreo",
    "Enseñanza",
    "Natación",
    "Foso de saltos",
    "Hidromasaje",
    "Terapéutico"
  ];
  // contenedor HTML donde se insertarán los gráficos accedemos a él a través de DOM.

  const contenedor = document.getElementById("contenedor-graficas");


  /*
   * Map almacena las categorías seleccionadas
   * para su comparación
   * clave: nombre de la categoría
   * valor: conjunto de registros de esa categoría
   */

  const seleccionadas = new Map();
  const botonComparar = document.getElementById("boton-comparar");

  function actualizarBoton() {
  botonComparar.textContent = `Comparar (${seleccionadas.size})`;
  botonComparar.disabled = seleccionadas.size !== 2;
  }

  //-----------------------------------
  //C. Filtado y ordenación de los datos 
  //------------------------------------
  /*
 * recorre las ocho categorías
 * para cada una. extrae los registros correspondientes
 * del CSV y los transforma en pares año-valor
 */
  categorias.forEach(nombre => {
    const datos = [];

    for (let i = 0; i < registros.getRowCount(); i++) {
      const fila = registros.getRow(i);

      if (fila.getString("Tipo de vaso") === nombre) {
        datos.push({
          anio: Number(fila.getString("Año")),
          total: Number(fila.getString("Total"))
        });
      }
    }

   
   // ordena los registros de menor a mayor año.
  // Esto garantiza que la línea gráfica siga
  // la secuencia temporal 2015–2022
 
  
    datos.sort((a, b) => a.anio - b.anio);

    //------------------------------------------------
    //D. Creación de tarjetas y contoles interactivos
    //------------------------------------------------

    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";

    
      const cabecera = document.createElement("div");
      cabecera.className = "cabecera-tarjeta";

      const titulo = document.createElement("h3");
      titulo.className = "titulo-grafica";
      titulo.textContent = nombre;

      const controles = document.createElement("div");
      controles.className = "controles-tarjeta";


      /*
       * Crea una casilla de selección para cada categoría.
       * Permite seleccionar un máximo de dos gráficos.
      */

      // Selección para comparar

      //-------------------------------------------------
      // D2. Selección de cartegorías
      //---------------------------------------

      const selector = document.createElement("input");
      selector.type = "checkbox";
      selector.className = "selector-comparacion";
      selector.setAttribute("aria-label", `Seleccionar ${nombre} para comparar`);
      selector.addEventListener("change", () => {
      if (selector.checked) {
      if (seleccionadas.size >= 2) {
        selector.checked = false;
        alert("Puedes seleccionar un máximo de dos gráficas.");
        return;
      }

    // Guarda la categoría y sus datos

      seleccionadas.set(nombre, datos);
    } else {

      // elimina la categoría si se desmarca
      seleccionadas.delete(nombre);
    }

      actualizarBoton();
    });
    //----------------------------------------
    //D3. ampliación individual de gráficos
    //----------------------------------------  
      // Botón para ampliar
      const ampliar = document.createElement("button");
      ampliar.type = "button";
      ampliar.className = "boton-ampliar";
      ampliar.textContent = "⛶";
      ampliar.title = `Ampliar gráfica de ${nombre}`;
      ampliar.setAttribute("aria-label", `Ampliar gráfica de ${nombre}`);

     ampliar.addEventListener("click", () => {
      const modal = document.getElementById("modal-grafica");
      const tituloModal = document.getElementById("titulo-modal");
      const zonaAmpliada = document.getElementById("grafica-ampliada");

      tituloModal.textContent = nombre;
      zonaAmpliada.innerHTML = "";

      crearGrafico(zonaAmpliada, datos);
      modal.hidden = false;
    });

      controles.appendChild(selector);
      controles.appendChild(ampliar);

      cabecera.appendChild(titulo);
      cabecera.appendChild(controles);

      const zona = document.createElement("div");
      zona.className = "zona-grafica";

      tarjeta.appendChild(cabecera);
      tarjeta.appendChild(zona);
      contenedor.appendChild(tarjeta);


    crearGrafico(zona, datos);
  });

  // Cerrar ventana // actualiza el estado del botón de comparación.

document.getElementById("cerrar-modal").addEventListener("click", () => {
  const modal = document.getElementById("modal-grafica");
  modal.hidden = true;
  document.getElementById("grafica-ampliada").innerHTML = "";
});

//------------------------------
// D4. Comparaciónde categorías
//-------------------------------
// dodigo del botón comparar

botonComparar.addEventListener("click", () => {

  if (seleccionadas.size !== 2) return;

  const modal = document.getElementById("modal-grafica");
  const tituloModal = document.getElementById("titulo-modal");
  const zonaAmpliada = document.getElementById("grafica-ampliada");

  tituloModal.textContent = "Comparación de espacios acuáticos";
  zonaAmpliada.innerHTML = "";
  zonaAmpliada.className = "graficas-comparacion";

  seleccionadas.forEach((datos, nombre) => {
    const bloque = document.createElement("div");
    bloque.className = "grafica-comparacion";

    const titulo = document.createElement("h3");
    titulo.textContent = nombre;

    const zona = document.createElement("div");

    bloque.appendChild(titulo);
    bloque.appendChild(zona);
    zonaAmpliada.appendChild(bloque);

    crearGrafico(zona, datos);
  });

  modal.hidden = false;
});


} // Fin de setup()

//-------------------------------------
// E. Cálculo de escalas y coordenadas
//----------------------------------------
/*
 * crearGrafico()
 * Genera una instancia independiente de p5.js
 * para cada conjunto de datos
 */

function crearGrafico(contenedor, datos) {
  new p5(p => {
    const x0 = M.izquierda;
    const x1 = ANCHO - M.derecha;
    const y0 = ALTO - M.abajo;
    const y1 = M.arriba;

  // extrae los valores numéricos de la categoría

    const valores = datos.map(d => d.total);

   // identifica los valores mínimo y máximo

    const minimo = Math.min(...valores);
    const maximo = Math.max(...valores);

    /*
     * calcula la amplitud del intervalo.
     * Math.max(1, ...) evita una amplitud nula
     * cuando todos los valores son iguales
     */
    const amplitud = Math.max(1, maximo - minimo);

    /*
     * Define una escala vertical independiente
     *
     * Se añade un margen del 15 % de la amplitud
     * por debajo y por encima de los valores (limites superior e inferior)
     *
     * El límite inferior no puede ser negativo
     */

    const inferior = Math.max(0, minimo - amplitud * 0.15);
    const superior = maximo + amplitud * 0.15;

     /*
     * Convierte los años y valores en coordenadas
     * del lienzo mediante p5.map()
     */

    const posX = anio => p.map(anio, 2015, 2022, x0, x1);
    const posY = total => p.map(total, inferior, superior, y0, y1);
    //-------------------------------------------------
    // F. Creación del lienzo y preparación gráfica
    //-------------------------------------------------
    /*
    * Crea el lienzo y lo incorpora al contenedor HTML
    */

    p.setup = () => {
      p.createCanvas(ANCHO, ALTO).parent(contenedor);
    };
    //-------------------------
    // F1. creación del liezo
    //------------------------
    /*
     * draw() se ejecuta repetidamente.
    * permite actualizar la visualización y detectar
    * la posición del ratón sobre los puntos
      */

    p.draw = () => {
      p.background(255);
      //-------------------------------
      // F2. Dibujo de ejes
      //---------------------------------
      // Dibuja los ejes horizontal y vertical.
      p.stroke(130);
      p.strokeWeight(1);
      p.line(x0, y1, x0, y0);
      p.line(x0, y0, x1, y0);

      //----------------------
      // F3. Escala vetical
      //---------------------
       /*
    * Dibuja cuatro referencias de la escala vertical
    * y sus correspondientes líneas horizontales
      */

      for (let i = 0; i <= 3; i++) {
        const valor = p.lerp(inferior, superior, i / 3);
        const y = posY(valor);

        p.stroke(230);
        p.line(x0, y, x1, y);



      // Sitúa los años en el eje horizontal.
        //----------------------------------------
        // F4. Representación de los anos
        //----------------------------------------
        p.noStroke();
        p.fill(75);
        p.textSize(10);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(Math.round(valor).toLocaleString("es-ES"), x0 - 6, y);
      }

      // Años
      p.noStroke();
      p.fill(75);
      p.textSize(9);
      p.textAlign(p.CENTER, p.TOP);

      datos.forEach(d => {
        p.text(d.anio, posX(d.anio), y0 + 8);
      });

      /*
       * une los valores mediante una línea temporal
       * cada vértice corresponde a un año del CSV
      */

      //--------------------------------
      //F5. Dibujo de la línea temporal
      //--------------------------------
      // Línea temporal
      p.noFill();
      p.stroke("#237445");
      p.strokeWeight(2.5);
      p.beginShape();

      datos.forEach(d => {
        p.vertex(posX(d.anio), posY(d.total));
      });

      p.endShape();

      //----------------------------------------------
      // G. Detección del ratón y etiquetas emergentes
      // toolkits

      //--------------------------------------------
      // Puntos y detección del ratón
      let activo = null;
      let distanciaMinima = 12;

      datos.forEach(d => {
        const x = posX(d.anio);
        const y = posY(d.total);
        const distancia = p.dist(p.mouseX, p.mouseY, x, y);

        if (distancia < distanciaMinima) {
          distanciaMinima = distancia;
          activo = d;
        }
      // Representa cada observación mediante un punto.
        p.fill("#237445");
        p.stroke(255);
        p.strokeWeight(1.5);
        p.circle(x, y, 7);
      });

      /*
      * Si el cursor se aproxima a un punto,
      * muestra el año y el valor exacto del registro = etiqueta emergente 
        */
      if (activo) {
        const x = posX(activo.anio);
        const y = posY(activo.total);

        p.fill("#14552e");
        p.stroke(255);
        p.circle(x, y, 11);

        const texto =
          `${activo.anio}: ${activo.total.toLocaleString("es-ES")}`;

        p.textSize(11);

        // tamaño de la etiqueta

        const ancho = p.textWidth(texto) + 18;

        /*
      * limita la posición horizontal para evitar
        * que la etiqueta salga del lienzo
         */
        const alto = 27;

        const tx = p.constrain(
          x - ancho / 2,
          2,
          ANCHO - ancho - 2
        );
        // situa la etiqueta encima o debajo del punto
        const ty = y > 42 ? y - 37 : y + 13;

        // fondo de la etiequeta color y typo
        p.noStroke();
        p.fill("#173f2a");
        p.rect(tx, ty, ancho, alto, 5);

        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(texto, tx + ancho / 2, ty + alto / 2);
      }
    };
  });
}
