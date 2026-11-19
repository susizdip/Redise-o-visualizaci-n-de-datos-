
let registros;
const ANCHO = 350;
const ALTO = 175;

const M = {
  izquierda: 48,
  derecha: 12,
  arriba: 18,
  abajo: 34
};

function preload() {
  registros = loadTable(
    "material/datos_piscinas.csv",
    "csv",
    "header"
  );
}

function setup() {
  noCanvas();

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

  const contenedor = document.getElementById("contenedor-graficas");


  const seleccionadas = new Map();
  const botonComparar = document.getElementById("boton-comparar");

  function actualizarBoton() {
  botonComparar.textContent = `Comparar (${seleccionadas.size})`;
  botonComparar.disabled = seleccionadas.size !== 2;
  }
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

    

    datos.sort((a, b) => a.anio - b.anio);

    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";

    
      const cabecera = document.createElement("div");
      cabecera.className = "cabecera-tarjeta";

      const titulo = document.createElement("h3");
      titulo.className = "titulo-grafica";
      titulo.textContent = nombre;

      const controles = document.createElement("div");
      controles.className = "controles-tarjeta";

      // Selección para comparar
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

      seleccionadas.set(nombre, datos);
    } else {
      seleccionadas.delete(nombre);
    }

      actualizarBoton();
    });

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

  // Cerrar ventana
document.getElementById("cerrar-modal").addEventListener("click", () => {
  const modal = document.getElementById("modal-grafica");
  modal.hidden = true;
  document.getElementById("grafica-ampliada").innerHTML = "";
});

// AQUÍ VA EL CÓDIGO DEL BOTÓN COMPARAR
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

function crearGrafico(contenedor, datos) {
  new p5(p => {
    const x0 = M.izquierda;
    const x1 = ANCHO - M.derecha;
    const y0 = ALTO - M.abajo;
    const y1 = M.arriba;

    const valores = datos.map(d => d.total);
    const minimo = Math.min(...valores);
    const maximo = Math.max(...valores);
    const amplitud = Math.max(1, maximo - minimo);

    const inferior = Math.max(0, minimo - amplitud * 0.15);
    const superior = maximo + amplitud * 0.15;

    const posX = anio => p.map(anio, 2015, 2022, x0, x1);
    const posY = total => p.map(total, inferior, superior, y0, y1);

    p.setup = () => {
      p.createCanvas(ANCHO, ALTO).parent(contenedor);
    };

    p.draw = () => {
      p.background(255);

      // Ejes
      p.stroke(130);
      p.strokeWeight(1);
      p.line(x0, y1, x0, y0);
      p.line(x0, y0, x1, y0);

      // Escala vertical y líneas de referencia
      for (let i = 0; i <= 3; i++) {
        const valor = p.lerp(inferior, superior, i / 3);
        const y = posY(valor);

        p.stroke(230);
        p.line(x0, y, x1, y);

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

      // Línea temporal
      p.noFill();
      p.stroke("#237445");
      p.strokeWeight(2.5);
      p.beginShape();

      datos.forEach(d => {
        p.vertex(posX(d.anio), posY(d.total));
      });

      p.endShape();

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

        p.fill("#237445");
        p.stroke(255);
        p.strokeWeight(1.5);
        p.circle(x, y, 7);
      });

      // Etiqueta emergente
      if (activo) {
        const x = posX(activo.anio);
        const y = posY(activo.total);

        p.fill("#14552e");
        p.stroke(255);
        p.circle(x, y, 11);

        const texto =
          `${activo.anio}: ${activo.total.toLocaleString("es-ES")}`;

        p.textSize(11);

        const ancho = p.textWidth(texto) + 18;
        const alto = 27;

        const tx = p.constrain(
          x - ancho / 2,
          2,
          ANCHO - ancho - 2
        );

        const ty = y > 42 ? y - 37 : y + 13;

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
