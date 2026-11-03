/* =========================================================
   PERSONALIZA ESTE OBJETO: nombre, carta y audios.
   Los nombres de los archivos de imagen se explican en LEEME.
   ========================================================= */
const CONFIG = {
  fullName: "Ingrid Yamilet",
  signature: "De alguien que te ama muchísimo ♡",
  letter: "Sé que esta noche no te pude acompañar y de verdad no sabes cuanto te he extraño, quisiera compartir estos momentos contigo, pero no me quise quedar con las manos cerradas y decidí hacer algo diferente aprovechando que he aprendido muchas cosas de programación. Gracias por formar parte de mi vida y ser alguien tan especial y única. Te quiero muuuuuuuchoooo",
  useRecordedRadioAudio: true,
  radioAudioFile: "assets/sounds/radio-01.mp3"
};

const rooms = {
  "bano": {
    title: "EL BAÑO", eyebrow: "HABITACIÓN 01 · BAÑO", image: "bano.jpg", emoji: "🪞",
    description: "El baño está en silencio. El espejo parece empañado, aunque nadie se ha duchado. Hay algo escrito en una esquina.",
    dialogue: "La luz parpadea una vez. ¿Qué habrá querido dejar alguien aquí?",
    clue: "En el espejo aparece una frase: «Vas por buen camino. No olvides mirar con atención»."
  },
  "cocina": {
    title: "LA COCINA", eyebrow: "HABITACIÓN 02 · COCINA", image: "cocina.jpg", emoji: "🍬",
    description: "Sobre la mesa hay un recipiente lleno de dulces. Al lado dejaron una bolsita preparada especialmente para la visita de Halloween.",
    dialogue: "Hay una etiqueta doblada debajo del recipiente...",
    clue: "La etiqueta dice: «Para la payasita que llegó a pedir dulces. Espero que le gusten». ¡Alguien sabía que vendrías!"
  },
  "mi-cuarto": {
    title: "MI CUARTO", eyebrow: "HABITACIÓN 03 · MI CUARTO", image: "mi-cuarto.jpg", emoji: "📻",
    description: "El cuarto está un poco desordenado. En el escritorio hay una radio antigua, varios papeles y una pequeña caja cerrada.",
    dialogue: "La radio cobra vida con un chasquido. Una voz parece intentar comunicarse...",
    clue: "La radio reproduce un mensaje: «¿Hola...? Si estás escuchando esto, es porque estamos apunto de conocernos»."
  },
  "cuarto-papas": {
    title: "EL CUARTO DE MIS PAPÁS", eyebrow: "HABITACIÓN 04 · CUARTO DE MIS PAPÁS", image: "cuarto-papas.jpg", emoji: "🕯️",
    description: "La habitación está tranquila. Sobre una cómoda hay un sobre cerrado con tu nombre escrito a mano.",
    dialogue: "El sobre tiene un pequeño dibujo de un fantasma. Parece que es la última pista.",
    clue: "Dentro del sobre hay una nota: «La persona que buscas está más cerca de lo que imaginas. Vuelve al pasillo»."
  }
};

const visited = new Set();
const $ = (id) => document.getElementById(id);
const screens = ["screen-start", "screen-outside", "screen-door", "screen-hall", "screen-room", "screen-ending"];
let audioEnabled = false;
let radioAudio = null;
let currentRoom = null;

function showScreen(id) {
  screens.forEach((screenId) => {
    const screen = $(screenId);
    screen.hidden = screenId !== id;
    screen.classList.toggle("active", screenId === id);
  });
  const progress = {"screen-start":0,"screen-outside":8,"screen-door":18,"screen-hall":30,"screen-room":48,"screen-ending":100};
  $("progress-fill").style.width = `${progress[id] || 0}%`;
}

function updateHall() {
  $("clue-count").textContent = `PISTAS ENCONTRADAS: ${visited.size} / 4`;
  document.querySelectorAll(".room-button").forEach((button) => {
    button.classList.toggle("visited", visited.has(button.dataset.room));
  });
  $("hall-finish").hidden = visited.size !== 4;
}

function setRoomArtwork(room) {
  const art = $("room-art");
  const oldImage = art.querySelector("img");
  if (oldImage) oldImage.remove();
  const image = new Image();
  image.alt = "";
  image.onload = () => {
    if (currentRoom === room) art.insertBefore(image, art.firstChild);
  };
  image.onerror = () => image.remove();
  image.src = `assets/images/${room.image}`;
  $("room-emoji").textContent = room.emoji;
  $("room-caption").textContent = room.title;
}

function loadStaticArtwork() {
  document.querySelectorAll(".scene-art[data-art]").forEach((art) => {
    const image = new Image();
    image.alt = "";
    image.onload = () => art.insertBefore(image, art.firstChild);
    image.onerror = () => image.remove();
    image.src = `assets/images/${art.dataset.art}`;
  });
}

function stopRadio() {
  if (radioAudio) {
    radioAudio.pause();
    radioAudio.currentTime = 0;
    radioAudio = null;
  }
}

function playRadio() {
  if (!audioEnabled || !CONFIG.useRecordedRadioAudio) return;
  stopRadio();
  radioAudio = new Audio(CONFIG.radioAudioFile);
  radioAudio.volume = 0.85;
  radioAudio.play().catch(() => console.info("No se encontró el audio de radio. Revisa el archivo en assets/sounds."));
}

function openRoom(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  currentRoom = room;
  $("room-eyebrow").textContent = room.eyebrow;
  $("room-title").textContent = room.title;
  $("room-description").textContent = room.description;
  $("room-dialogue").textContent = room.dialogue;
  $("room-result").textContent = visited.has(roomId) ? "Ya encontraste la pista de esta habitación." : "";
  $("inspect-room").textContent = visited.has(roomId) ? "PISTA ENCONTRADA ✓" : "EXAMINAR LA HABITACIÓN";
  $("inspect-room").disabled = visited.has(roomId);
  setRoomArtwork(room);
  showScreen("screen-room");
  if (roomId === "mi-cuarto") playRadio();
  else stopRadio();
}

function inspectRoom() {
  if (!currentRoom) return;
  const id = Object.keys(rooms).find((key) => rooms[key] === currentRoom);
  if (!id || visited.has(id)) return;
  visited.add(id);
  $("room-result").textContent = currentRoom.clue;
  $("inspect-room").textContent = "PISTA ENCONTRADA ✓";
  $("inspect-room").disabled = true;
  stopRadio();
}

function showEnding() {
  stopRadio();
  $("letter-name").textContent = CONFIG.fullName;
  $("letter-text").textContent = CONFIG.letter;
  $("letter-signature").textContent = CONFIG.signature;
  showScreen("screen-ending");
}

function resetGame() {
  visited.clear();
  currentRoom = null;
  stopRadio();
  updateHall();
  showScreen("screen-start");
}

$("begin").addEventListener("click", () => showScreen("screen-outside"));
$("knock").addEventListener("click", () => showScreen("screen-door"));
$("enter-house").addEventListener("click", () => { showScreen("screen-hall"); updateHall(); });
$("stay-outside").addEventListener("click", () => showScreen("screen-outside"));
document.querySelectorAll(".room-button").forEach((button) => {
  button.addEventListener("click", () => openRoom(button.dataset.room));
});
$("inspect-room").addEventListener("click", inspectRoom);
$("back-hall").addEventListener("click", () => { stopRadio(); showScreen("screen-hall"); updateHall(); });
$("hall-finish").addEventListener("click", showEnding);
$("again").addEventListener("click", resetGame);

$("sound-toggle").addEventListener("click", () => {
  audioEnabled = !audioEnabled;
  $("sound-toggle").setAttribute("aria-pressed", String(audioEnabled));
  $("sound-toggle").innerHTML = `♫ <span>SONIDO: ${audioEnabled ? "ON" : "OFF"}</span>`;
  if (!audioEnabled) stopRadio();
  else if (currentRoom && currentRoom.title === rooms["mi-cuarto"].title) playRadio();
});

// El juego inicia sin reproducir sonidos automáticamente.
loadStaticArtwork();
updateHall();
