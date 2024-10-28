// Variables para las raquetas, pelota, marcos y puntajes
let raquetaJugador, raquetaComputadora;
let pelota;
let velocidadPelotaX = 8;
let velocidadPelotaY = 8;
let anchoRaqueta = 20;
let altoRaqueta = 100;
let puntuacionJugador = 0;
let puntuacionComputadora = 0;
let velocidadRaquetaComputadora = 3; // Velocidad de la raqueta de la computadora
let altoMarco = 10; // Altura del marco superior e inferior

let fondo, imgRaquetaJugador, imgRaquetaComputadora; // Variables para las imágenes
let diametroPelota = 18; // Diámetro inicial de la pelota
let factorPulsacion = 1; // Factor de pulsación
let pulsando = false; // Estado de pulsación

let colorFondoNormal; // Color de fondo normal
let colorFondoPuntuacion; // Color de fondo al anotar
let mostrandoPuntuacion = false; // Bandera para indicar si se está mostrando el color de puntuación
let mostrandoTexto = false; // Bandera para mostrar el texto de "Anotaste"
let juegoPausado = false; // Estado del juego (pausado o en juego)

let sonidoRebote; // Variable para el sonido de rebote
let sonidoPunto; // Sonido al anotar un punto

function preload() {
  // Cargar las imágenes antes de que comience el juego
  fondo = loadImage('fondo1.jpg'); // Ruta del archivo "fondo1.jpg"
  imgRaquetaJugador = loadImage('barra1.png'); // Imagen de la raqueta del jugador
  imgRaquetaComputadora = loadImage('barra2.png'); // Imagen de la raqueta de la computadora
  sonidoRebote = loadSound('bounce.mp3'); // Cargar el sonido de rebote
  sonidoPunto = loadSound('punto.mp3'); // Sonido al anotar un punto
}

function setup() {
  createCanvas(800, 400); // Crear el canvas para el juego
  raquetaJugador = new Raqueta(20, imgRaquetaJugador); // Raqueta del jugador a 20 píxeles del borde
  raquetaComputadora = new Raqueta(width - 40, imgRaquetaComputadora); // Raqueta de la computadora a 40 píxeles del borde derecho
  pelota = new Pelota(); // Crear la pelota

  colorFondoNormal = color(0, 0, 0); // Color de fondo normal (negro)
  colorFondoPuntuacion = color(241, 7, 7); // Color de fondo al anotar (rojo)
}

function draw() {
  if (mostrandoPuntuacion) {
    background(colorFondoPuntuacion); // Color de fondo al anotar
    mostrarTexto(); // Mostrar el texto "Anotaste"
    return; // Termina aquí el loop de draw cuando se está mostrando la puntuación
  } else {
    background(fondo); // Dibujar el fondo de la imagen
  }

  mostrarPuntuaciones();
  mostrarMarcos(); // Mostrar los marcos superior e inferior

  if (!juegoPausado) {
    // Mostrar y mover las raquetas solo si el juego no está pausado
    raquetaJugador.mostrar();
    raquetaJugador.mover(mouseY); // Control de la raqueta del jugador con el mouse
    raquetaComputadora.mostrar();
    raquetaComputadora.moverComputadora(pelota.y); // Mover la raqueta de la computadora siguiendo la pelota

    // Mostrar y mover la pelota solo si el juego no está pausado
    pelota.mostrar();
    pelota.mover();

    // Colisión con las raquetas
    pelota.colisionConRaqueta(raquetaJugador);
    pelota.colisionConRaqueta(raquetaComputadora);

    // Colisión con los marcos superior e inferior
    pelota.colisionConMarcos();

    // Verificar si la pelota sale del lado izquierdo (punto para la   computadora)
    if (pelota.x < 0) {
      puntuacionComputadora++;
      sonidoPunto.play(); // Reproducir el sonido de punto
      cambiarFondo(); // Cambiar el color de puntuación
      narrarMarcador(); // Narrar el nuevo marcador
      pelota.reiniciar();
    }

    // Verificar si la pelota sale del lado derecho (punto para el jugador)
    if (pelota.x > width) {
      puntuacionJugador++;
      sonidoPunto.play(); // Reproducir el sonido de punto
      cambiarFondo(); // Cambiar el color de puntuación
      narrarMarcador(); // Narrar el nuevo marcador
      pelota.reiniciar();
    }
  }
}

// Cambiar el color de puntuación y pausar el juego
function cambiarFondo() {
  mostrandoPuntuacion = true; // Activar la visualización del color de puntuación
  mostrandoTexto = true; // Activar la visualización del texto "Anotaste"
  juegoPausado = true; // Pausar el juego

  setTimeout(() => {
    mostrandoPuntuacion = false; // Desactivar la visualización del color de puntuación
    mostrandoTexto = false; // Desactivar la visualización del texto
    juegoPausado = false; // Reanudar el juego
  }, 1000); // Mantener el color y el texto durante 1000 ms
}

// Mostrar el texto "Anotaste"
function mostrarTexto() {
  fill(49, 44, 43); // Color del texto
  textSize(32);
  textAlign(CENTER);
  text("¡Punto!", width / 2, height / 2); // Mostrar el texto en el centro del canvas
}

function narrarMarcador() {
  // Cancela cualquier otra narración en curso
  window.speechSynthesis.cancel();

  // Crea el mensaje de narración
  const mensaje = `El marcador es ${puntuacionJugador} a ${puntuacionComputadora}`;
  const narracion = new SpeechSynthesisUtterance(mensaje);
  narracion.lang = 'es-ES'; // Establece el idioma a español

  // Configura la voz específica si está disponible
  const vocesDisponibles = window.speechSynthesis.getVoices();
  if (vocesDisponibles.length > 0) {
    narracion.voice = vocesDisponibles.find(voice => voice.lang === 'es-ES');
  }

  // Inicia la narración
  window.speechSynthesis.speak(narracion);
}

// Cargar las voces cuando estén disponibles
window.speechSynthesis.onvoiceschanged = () => {
  narrarMarcador(); // Llama a la función narrarMarcador para garantizar que use la voz seleccionada
};

// Clase Raqueta
class Raqueta {
  constructor(x, imagen) {
    this.x = x;
    this.y = height / 2 - altoRaqueta / 2;
    this.imagen = imagen; // Imagen de la raqueta
  }

  mostrar() {
    image(this.imagen, this.x, this.y, anchoRaqueta, altoRaqueta); // Mostrar la imagen de la raqueta
  }

  mover(posicionY) {
    this.y = constrain(posicionY - altoRaqueta / 2, altoMarco, height - altoRaqueta - altoMarco); // Limitar dentro del canvas
  }

  moverComputadora(posicionYPelota) {
    if (this.y + altoRaqueta / 2 < posicionYPelota) {
      this.y += velocidadRaquetaComputadora; // Mueve hacia abajo
    } else if (this.y + altoRaqueta / 2 > posicionYPelota) {
      this.y -= velocidadRaquetaComputadora; // Mueve hacia arriba
    }
    this.y = constrain(this.y, altoMarco, height - altoRaqueta - altoMarco); // Limitar dentro del canvas
  }
}

// Clase Pelota
class Pelota {
  constructor() {
    this.reiniciar();
    this.color = color(255, 0, 0);
  }

  mostrar() {
    fill(this.color);
    ellipse(this.x, this.y, diametroPelota * factorPulsacion, diametroPelota * factorPulsacion); // Dibujar la pelota
  }

  mover() {
    this.x += velocidadPelotaX;
    this.y += velocidadPelotaY;
  }

  colisionConRaqueta(raqueta) {
    if (
      this.x - 10 < raqueta.x + anchoRaqueta &&
      this.x + 10 > raqueta.x &&
      this.y > raqueta.y &&
      this.y < raqueta.y + altoRaqueta
    ) {
      velocidadPelotaX *= -1;
      if (this.x < raqueta.x) {
        this.x = raqueta.x - 10;
      } else {
        this.x = raqueta.x + anchoRaqueta + 10;
      }
      sonidoRebote.play(); // Reproducir el sonido de rebote al colisionar
      this.pulsar();
    }
  }

  colisionConMarcos() {
    if (this.y - 10 < altoMarco || this.y + 10 > height - altoMarco) {
      velocidadPelotaY *= -1;
      this.pulsar();
    }
  }

  pulsar() {
    pulsando = true;
    factorPulsacion = 1.5;
    setTimeout(() => {
      factorPulsacion = 1;
      pulsando = false;
    }, 100);
  }

  reiniciar() {
    this.x = width / 2;
    this.y = height / 2;
    velocidadPelotaX *= random([-1, 1]);
    velocidadPelotaY = random(2, 5) * random([-1, 1]);
  }
}

// Mostrar puntajes
function mostrarPuntuaciones() {
  textSize(32);
  fill(252, 60, 8);
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 0;
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(255, 255, 255, 0.8)';
  text(puntuacionJugador, width / 4, 40);
  text(puntuacionComputadora, (width * 3) / 4, 40);
}

// Mostrar los marcos superior e inferior
function mostrarMarcos() {
  fill(0);
  rect(0, 0, width, altoMarco);
  rect(0, height - altoMarco, width, altoMarco);
}

