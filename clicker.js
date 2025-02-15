
let isInitialState = true; // Bandera para controlar el estado inicial

// Variables para el título y versión
const gameTitle = "Bondi Clicker";
const gameVersion = "0.0.3";

// Variables para los textos de los botones
const cobrarBoletoText = "Cobrar Boleto";
const contratarChoferText = "Desbloquear (Costo: 100)";
const siguienteParadaText = "Desbloquear (Costo: 1000)";
const busCostaText = "Desbloquear (Costo: 15000)";


document.addEventListener("DOMContentLoaded", () => {
  const savedState = localStorage.getItem('gameState');
  if (savedState) {
    loadGameState(counterSubject); // Cargar el estado del juego si existe
    isInitialState = false; // Marcar el estado como "no inicial" después de cargar
  } else {
    // Inicializar el juego con valores por defecto
    counterSubject.counter = 0;
    counterSubject.progress = 0;
    counterSubject.busCostaProgress = 0;
    counterSubject.busCostaReady = false;
    counterSubject.purchasedButtons = new Set();
    counterSubject.buttonLevels = {
      "cobrar-boleto": 1,
      "contratar-chofer": 1,
      "siguiente-parada": 1,
      "bus-costa": 1,
    };
    counterSubject.busLevel = 1;
    counterSubject.busMultiplier = 1;
    counterSubject.busUpgradeCost = 5000;
    counterSubject.choferMultiplier = 1;
    counterSubject.choferUpgradeCost = 10000;
    counterSubject.choferLevel = 1;
  }

  updateBusCostaButton();
  updateButtonStyles();



  document.querySelector('#siguiente-parada-fill').style = 'background-color:#1976d2';
  document.querySelector('#bus-costa-fill').style = 'background-color:#1976d2';

  // Asignar el título y la versión
  const titleElement = document.querySelector("h1");
  titleElement.innerHTML = `${gameTitle} <busspan style="font-size: 1rem; font-family: Arial, Helvetica, sans-serif;">${gameVersion}</span>`;

  // Asignar los textos de los botones
  document.getElementById("cobrar-boleto").textContent = cobrarBoletoText;
  document.getElementById("contratar-chofer").textContent = contratarChoferText;
  document.getElementById("siguiente-parada").textContent = siguienteParadaText;
  document.getElementById("bus-costa").textContent = busCostaText;
  document.getElementById("mejorar-bus").textContent = document.querySelector('#mejorar-bus').textContent = `Mejorar bondi (Costo: ${formatNumber(counterSubject.busUpgradeCost)})`;
  document.getElementById("mejorar-chofer").textContent =  document.querySelector('#mejorar-chofer').textContent = `Mejorar chofer (Costo: ${formatNumber(counterSubject.choferUpgradeCost)})`;

  // Asignar las imágenes
  document.getElementById("bus-image").src = `img/bus${counterSubject.busLevel}.jpg`;
  document.getElementById("chofer-image").src = `/img/chofer${counterSubject.choferLevel}.jpg`;

  // Cargar el estado del juego y otras inicializaciones
  loadGameState(counterSubject);
  counterSubject.notifyObservers();
  updateButtonStyles();
  counterSubject.notifyProgress();
  counterSubject.notifyBusCostaProgress();

  // Actualizar niveles de botones, bus y chofer
  Object.keys(counterSubject.buttonLevels).forEach(buttonId => {
    const levelDisplay = document.getElementById(`${buttonId}-level`);
    if (levelDisplay) {
      levelDisplay.textContent = `Nivel ${counterSubject.buttonLevels[buttonId]}`;
    }
  });

/*
  const busLevelDisplay = document.getElementById("bus-level");
  if (busLevelDisplay) {
    busLevelDisplay.textContent = `Nivel ${counterSubject.busLevel}`;
  }

  const choferLevelDisplay = document.getElementById("chofer-level");
  if (choferLevelDisplay) {
    choferLevelDisplay.textContent = `Nivel ${counterSubject.choferLevel}`;
  }
*/

    // Si el chofer ya estaba contratado, actualizar el botón
    if (counterSubject.purchasedButtons.has("contratar-chofer")) {
      const contratarChoferButton = document.getElementById("contratar-chofer");
      contratarChoferButton.textContent = "¡Chofer contratado!";
      contratarChoferButton.style.backgroundColor = "#90caf9";
      contratarChoferButton.disabled = true;
    }

    // Si la parada ya estaba comprada, actualizar el botón
    if (counterSubject.purchasedButtons.has("siguiente-parada")) {
      const siguienteParadaButton = document.getElementById("siguiente-parada");
      siguienteParadaButton.textContent = "Conducir a la siguiente parada";

    }

    // Si viajar a la costa esta comprado, actualizar el botón
    if (counterSubject.purchasedButtons.has("bus-costa")) {
      const busCostaButton = document.getElementById("bus-costa");
      busCostaButton.textContent = "Viajar a la costa";
    }

    // Actualizar upgrades de bondi
    if (counterSubject.busLevel >= 10) {
      const busUpgradeButton = document.querySelector('#mejorar-bus')
      busUpgradeButton.textContent = 'Bondi al nivel máximo'
      busUpgradeButton.style.backgroundColor = "#90caf9";
    }

    // Actualizar upgrades de bondi
    if (counterSubject.choferLevel >= 5) {
      const busUpgradeButton = document.querySelector('#mejorar-chofer')
      busUpgradeButton.textContent = 'Chofer al nivel máximo'
      busUpgradeButton.style.backgroundColor = "#90caf9";
    }
});

function saveGameState(subject) {
  if (isInitialState) {
    return; // No guardar el estado si es el estado inicial
  }

  const gameState = {
    counter: subject.counter,
    progress: subject.progress,
    busCostaProgress: subject.busCostaProgress,
    busCostaReady: subject.busCostaReady,
    purchasedButtons: Array.from(subject.purchasedButtons),
    buttonLevels: subject.buttonLevels,
    busLevel: subject.busLevel,
    busMultiplier: subject.busMultiplier,
    busUpgradeCost: subject.busUpgradeCost,
    choferMultiplier: subject.choferMultiplier,
    choferUpgradeCost: subject.choferUpgradeCost,
    choferLevel: subject.choferLevel,
    buttonTexts: {
      "cobrar-boleto": document.getElementById("cobrar-boleto").textContent,
      "contratar-chofer": document.getElementById("contratar-chofer").textContent,
      "siguiente-parada": document.getElementById("siguiente-parada").textContent,
      "bus-costa": document.getElementById("bus-costa").textContent,
      "mejorar-bus": document.getElementById("mejorar-bus").textContent,
      "mejorar-chofer": document.getElementById("mejorar-chofer").textContent,
    },
    buttonUpgradeCosts: subject.buttonUpgradeCosts, // Guardar los costos de mejora
  };
  localStorage.setItem('gameState', JSON.stringify(gameState));
}


  
function loadGameState(subject) {
  const savedState = localStorage.getItem('gameState');
  if (savedState) {
    const gameState = JSON.parse(savedState);
    subject.counter = gameState.counter;
    subject.progress = gameState.progress;
    subject.busCostaProgress = gameState.busCostaProgress;
    subject.busCostaReady = gameState.busCostaReady;
    subject.purchasedButtons = new Set(gameState.purchasedButtons);
    subject.buttonLevels = gameState.buttonLevels;
    subject.busLevel = gameState.busLevel;
    subject.busMultiplier = gameState.busMultiplier;
    subject.busUpgradeCost = gameState.busUpgradeCost;
    subject.choferMultiplier = gameState.choferMultiplier;
    subject.choferUpgradeCost = gameState.choferUpgradeCost;
    subject.choferLevel = gameState.choferLevel;
    subject.buttonUpgradeCosts = gameState.buttonUpgradeCosts || { // Cargar los costos de mejora
      "cobrar-boleto": 50,
      "contratar-chofer": 50,
      "siguiente-parada": 50,
      "bus-costa": 50,
    };

    // Si el chofer ya estaba contratado, activar el incremento automático
    if (subject.purchasedButtons.has("contratar-chofer")) {
      const level = subject.buttonLevels["contratar-chofer"];
      const multiplier = subject.busMultiplier * subject.choferMultiplier;
      const intervalTime = 1000 / level;
      subject.intervalId = setInterval(() => {
        const amount = Math.round(multiplier);
        createAnimatedNumber(amount);
        subject.counter = Math.round(subject.counter + multiplier);
        subject.notifyObservers();
        saveGameState(subject); // Guardar el estado durante el incremento automático
      }, intervalTime);
    }
  }
}


class Subject {
  constructor() {
    this.observers = [];
    this.counter = 0;
    this.intervalId = null;
    this.progressIntervalId = null;
    this.busCostaIntervalId = null;
    this.progress = 0;
    this.busCostaProgress = 0;
    this.busCostaReady = false;
    this.purchasedButtons = new Set();
    this.buttonLevels = {
      "cobrar-boleto": 1,
      "contratar-chofer": 1,
      "siguiente-parada": 1,
      "bus-costa": 1,
    };
    this.busLevel = 1;
    this.busMultiplier = 1;
    this.busUpgradeCost = 5000
    this.choferMultiplier = 1;
    this.choferUpgradeCost = 10000;
    this.choferUpgradePercentage = 0.1;
    this.choferLevel = 1;
    this.choferMaxLevel = 5;
    this.buttonUpgradeCosts = {
      "cobrar-boleto": 50,
      "contratar-chofer": 50,
      "siguiente-parada": 50,
      "bus-costa": 50,
    };

    

    // Cargar el estado guardado al iniciar
    loadGameState(this);
  }

  addObserver(observer) {
    this.observers.push(observer);
  }

  notifyObservers() {
    this.observers.forEach(observer => observer.update(this.counter));
  }

  increment() {
    const level = this.buttonLevels["cobrar-boleto"];
    const multiplier = getMultiplier(level) * this.busMultiplier;
    const amount = Math.round(multiplier);
    createAnimatedNumber(amount);
    this.counter = Math.round(this.counter + multiplier);
    this.notifyObservers();
    saveGameState(this); // Guardar el estado después de incrementar
  }

  toggleIncrementPerSecond() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    } else {
      const level = this.buttonLevels["contratar-chofer"];
      const multiplier = this.busMultiplier * this.choferMultiplier;
      const intervalTime = 1000 / level;
      this.intervalId = setInterval(() => {
        const amount = Math.round(multiplier);
        createAnimatedNumber(amount);
        this.counter = Math.round(this.counter + multiplier);
        this.notifyObservers();
        saveGameState(this); // Guardar el estado durante el incremento automático
      }, intervalTime);
    }
    saveGameState(this);
  }
  restartIncrementPerSecond() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.toggleIncrementPerSecond();
    }
  }

  startProgressBar(callback) {
    if (this.progressIntervalId) return;

    const level = this.buttonLevels["siguiente-parada"];
    const multiplier = getMultiplier(level) * this.busMultiplier;
    this.progressIntervalId = setInterval(() => {
      this.progress += 1;
      if (this.progress >= 100) {
        clearInterval(this.progressIntervalId);
        this.progressIntervalId = null;
        this.progress = 0;
        const amount = Math.round(100 * multiplier);
        createAnimatedNumber(amount);
        this.counter = Math.round(this.counter + 100 * multiplier);
        callback(multiplier);
        saveGameState(this); // Guardar el estado después de completar la barra de progreso
      }
      this.notifyProgress();
    }, 30);
  }

  startBusCostaProgressBar() {
    if (this.busCostaIntervalId) return;

    const level = this.buttonLevels["bus-costa"];
    const multiplier = getMultiplier(level) * this.busMultiplier;
    this.busCostaIntervalId = setInterval(() => {
      this.busCostaProgress += 1;
      if (this.busCostaProgress >= 100) {
        clearInterval(this.busCostaIntervalId);
        this.busCostaIntervalId = null;
        this.busCostaReady = true;
        saveGameState(this); // Guardar el estado cuando el Bus Costa está listo
      }
      this.notifyBusCostaProgress();
    }, 100);
  }

  claimBusCostaReward() {
    if (this.busCostaReady) {
      const level = this.buttonLevels["bus-costa"];
      const multiplier = getMultiplier(level) * this.busMultiplier;
      const amount = Math.round(1000 * multiplier);
      createAnimatedNumber(amount);
      this.counter = Math.round(this.counter + 1000 * multiplier);
      this.busCostaReady = false;
      this.busCostaProgress = 0;
      this.notifyObservers();
      this.notifyBusCostaProgress();
      saveGameState(this); // Guardar el estado después de reclamar la recompensa
    }
  }

  purchaseButton(buttonId, cost) {
    if (this.counter >= cost && !this.purchasedButtons.has(buttonId)) {
      this.counter -= cost;
      this.purchasedButtons.add(buttonId);
      this.notifyObservers();
      saveGameState(this); // Guardar el estado después de comprar un botón
      return true;
    }
    return false;
  }

  upgradeButton(buttonId) {
    const currentUpgradeCost = this.buttonUpgradeCosts[buttonId];
  
    if (this.counter >= currentUpgradeCost) {
      this.counter -= currentUpgradeCost; // Restar el costo
      this.buttonLevels[buttonId] += 1; // Aumentar el nivel
      this.buttonUpgradeCosts[buttonId] = Math.round(currentUpgradeCost * 1.25); // Aumento del 25%

  
      this.notifyObservers();
      saveGameState(this); // Guardar el estado después de mejorar
  
      if (buttonId === "contratar-chofer" && this.intervalId) {
        this.restartIncrementPerSecond();
      }

      return true;
    }
    return false;
  }

  upgradeBus(cost) {
    if (this.counter >= cost && this.busLevel < 10) {
      this.counter -= cost;
      this.busLevel += 1;
      this.busMultiplier *= 2;
      this.busUpgradeCost *= 2;
      saveGameState(this); // Guardar el estado después de mejorar el bus
  
      if (this.intervalId) {
        this.restartIncrementPerSecond();
      }
      this.notifyObservers();
      return true;
    }
    return false;
  }

  upgradeChofer(cost) {
    if (this.counter >= cost && this.choferLevel < this.choferMaxLevel) {
      this.counter -= cost;
      this.choferMultiplier *= (1 + this.choferUpgradePercentage);
      this.choferUpgradeCost *= 2; // Duplicar el costo para el próximo nivel
      this.choferLevel += 1;
      saveGameState(this); // Guardar el estado después de mejorar al chofer
      return true;
    } else if (this.choferLevel >= this.choferMaxLevel) {
      mostrarNotificacion("¡El chofer ya está en su nivel máximo!");
      return false;
    }
    return false;
  }


  notifyProgress() {
    this.observers.forEach(observer => observer.updateProgress(this.progress));
  }

  notifyBusCostaProgress() {
    this.observers.forEach(observer => observer.updateBusCostaProgress(this.busCostaProgress));
  }
}

class Observer {
  constructor(updateFunction, updateProgressFunction, updateBusCostaProgressFunction) {
    this.updateFunction = updateFunction;
    this.updateProgressFunction = updateProgressFunction;
    this.updateBusCostaProgressFunction = updateBusCostaProgressFunction;
  }

  update(newValue) {
    this.updateFunction(newValue);
  }

  updateProgress(newProgress) {
    this.updateProgressFunction(newProgress);
  }

  updateBusCostaProgress(newProgress) {
    this.updateBusCostaProgressFunction(newProgress);
  }
}

const counterSubject = new Subject();

const displayObserver = new Observer(
  (newValue) => {
    document.getElementById("counter-display").textContent = formatNumber(newValue);
  },
  (newProgress) => {
    document.getElementById("siguiente-parada-fill").style.width = `${newProgress}%`;
    document.getElementById("siguiente-parada-fill").textContent = `${newProgress}%`;
  },
  (newProgress) => {
    document.getElementById("bus-costa-fill").style.width = `${newProgress}%`;
    document.getElementById("bus-costa-fill").textContent = `${newProgress}%`;
  }
);

counterSubject.addObserver(displayObserver);

function mostrarNotificacion(mensaje) {
  const notificacion = document.getElementById("notificacion");
  notificacion.textContent = mensaje;
  notificacion.classList.add("mostrar");

  setTimeout(() => {
    notificacion.classList.remove("mostrar");
  }, 6000);
}

// Llamar a updateButtonStyles después de comprar un botón
function purchaseButton(buttonId, cost) {
  if (counterSubject.purchaseButton(buttonId, cost)) {
    const button = document.getElementById(buttonId);
    button.classList.remove("blocked");
    button.classList.add("purchased");
    button.disabled = false;

    // Actualizar el texto del botón
    if (buttonId === "contratar-chofer") {
      button.textContent = "¡Chofer contratado!";
    } else if (buttonId === "siguiente-parada") {
      button.textContent = "Conducir a la siguiente parada";
    } else if (buttonId === "bus-costa") {
      button.textContent = "Viajar a la Costa";
    }

    updateButtonStyles(); // Actualizar estilos después de comprar
  } else {
    mostrarNotificacion("¡No tienes suficientes puntos para comprar este botón!");
  }
}

function upgradeButton(buttonId, cost) {
  if (counterSubject.upgradeButton(buttonId, cost)) {
    const levelDisplay = document.getElementById(`${buttonId}-level`);
    const newLevel = counterSubject.buttonLevels[buttonId];
    levelDisplay.textContent = `Nivel ${newLevel}`;
  } else {
    mostrarNotificacion("¡No tienes suficientes puntos para mejorar este botón!");
  }
}

function upgradeBus() {
  const cost = counterSubject.busUpgradeCost;
  if (counterSubject.upgradeBus(cost)) {
    const busImage = document.getElementById("bus-image");
    busImage.src = `img/bus${counterSubject.busLevel}.jpg`;

    const mejorarBusButton = document.getElementById("mejorar-bus");
    
    if (counterSubject.busLevel < 10) {
      mejorarBusButton.textContent = `Mejorar bondi (Costo: ${formatNumber(counterSubject.busUpgradeCost)})`;
    } else {
      mejorarBusButton.textContent = "Bondi a nivel máximo";
      mejorarBusButton.disabled = true;
    }

    // Guardar el estado del botón en localStorage
    saveGameState(counterSubject);
  } else if (counterSubject.busLevel >= 10) {
    mostrarNotificacion("¡El bondi ya está en su nivel máximo!");
  } else {
    mostrarNotificacion("¡No tienes suficientes puntos para mejorar el bondi!");
  }
}


function upgradeChofer() {
  const cost = counterSubject.choferUpgradeCost;
  if (counterSubject.upgradeChofer(cost)) {
    const choferImage = document.getElementById("chofer-image");
    choferImage.src = `img/chofer${counterSubject.choferLevel}.jpg`;

    const mejorarChoferButton = document.getElementById("mejorar-chofer");
    if (counterSubject.choferLevel < counterSubject.choferMaxLevel) {
      // Formatear el costo correctamente
      mejorarChoferButton.textContent = `Mejorar chofer (Costo: ${formatNumber(counterSubject.choferUpgradeCost)})`;
    } else {
      mejorarChoferButton.textContent = "Chofer a nivel máximo";
      mejorarChoferButton.disabled = true;
    }

    // Guardar el estado del botón en localStorage
    saveGameState(counterSubject);
  } else if (counterSubject.choferLevel >= counterSubject.choferMaxLevel) {
    mostrarNotificacion("¡El chofer ya está en su nivel máximo!");
  } else {
    mostrarNotificacion("¡No tienes suficientes puntos para mejorar al chofer!");
  }
}

function updateBusCostaButton() {
  const busCostaButton = document.getElementById("bus-costa");
  if (counterSubject.busCostaReady) {
    // Cuando el progreso está completo, el botón debe estar en azul
    busCostaButton.classList.add("ready");
    busCostaButton.style.backgroundColor = "#1976d2"; // Azul
    busCostaButton.textContent = "Cobrar viaje";
  } else if (counterSubject.busCostaProgress > 0 && counterSubject.busCostaProgress < 100) {
    // Cuando el progreso está en curso, el botón debe estar en gris
    busCostaButton.style.backgroundColor = "grey";
    busCostaButton.textContent = "Viajando...";
  } else {
    // Cuando no hay progreso, el botón debe estar en azul
    //busCostaButton.style.backgroundColor = "#1976d2"; // Azul
    //busCostaButton.textContent = "Desbloquear (Costo: 15000)";
  }
}

// Asegúrate de llamar a esta función cuando se actualice el progreso del Bus Costa
counterSubject.addObserver(new Observer(
  () => {},
  () => {},
  () => {
    updateBusCostaButton();
  }
));

document.getElementById("bus-costa").addEventListener("click", function() {
  if (!this.classList.contains("purchased")) {
    purchaseButton("bus-costa", 15000);
  } else {
    if (counterSubject.busCostaReady) {
      counterSubject.claimBusCostaReward();
      this.textContent = "Viajar a la Costa";
      this.style.backgroundColor = "#1976d2"; // Azul
    } else {
      counterSubject.startBusCostaProgressBar();
      this.textContent = "Viajando...";
      this.style.backgroundColor = "grey"; // Gris
    }
  }
});

// Llama a esta función cuando se actualice el progreso del Bus Costa
counterSubject.addObserver(new Observer(
  () => {},
  () => {},
  () => {
    updateBusCostaButton();
  }
));

function updateButtonStyles() {
  const buttons = [
    { id: "cobrar-boleto", cost: 0 },
    { id: "contratar-chofer", cost: 100 },
    { id: "siguiente-parada", cost: 1000 },
    { id: "bus-costa", cost: 15000 },
  ];

  buttons.forEach(button => {
    const buttonElement = document.getElementById(button.id);
    const upgradeButton = document.querySelector(`.upgrade-button[data-target="${button.id}"]`);
    const upgradeCost = counterSubject.buttonUpgradeCosts[button.id];

    // Actualizar el texto del botón de upgrade
    upgradeButton.textContent = `↑ (${formatNumber(upgradeCost)})`;

    // Lógica especial para el botón "Cobrar Boleto"
    if (button.id === "cobrar-boleto") {
      buttonElement.classList.remove("blocked");
      buttonElement.disabled = false;

      // Verificar si hay suficientes puntos para mejorar
      if (counterSubject.counter >= upgradeCost) {
        upgradeButton.classList.remove("blocked");
        upgradeButton.disabled = false;
      } else {
        upgradeButton.classList.add("blocked");
        upgradeButton.disabled = true;
      }
    } else {
      // Lógica para los demás botones
      if (counterSubject.purchasedButtons.has(button.id)) {
        buttonElement.classList.remove("blocked");
        buttonElement.classList.add("purchased");

        // Verificar si hay suficientes puntos para mejorar
        if (counterSubject.counter >= upgradeCost) {
          upgradeButton.classList.remove("blocked");
          upgradeButton.disabled = false;
        } else {
          upgradeButton.classList.add("blocked");
          upgradeButton.disabled = true;
        }
      } else {
        // Si el botón principal no está comprado, verificar si hay suficientes puntos para comprarlo
        if (counterSubject.counter >= button.cost) {
          buttonElement.classList.remove("blocked");
          buttonElement.disabled = false;
        } else {
          buttonElement.classList.add("blocked");
          buttonElement.disabled = true;
        }

        // El botón de upgrade debe estar bloqueado si el botón principal no está comprado
        upgradeButton.classList.add("blocked");
        upgradeButton.disabled = true;
      }
    }
  });
}

// Llamar a esta función al cargar el estado del juego
updateButtonStyles();

counterSubject.addObserver(new Observer(
  () => {
    updateButtonStyles();
  },
  () => {},
  () => {}
));

function createAnimatedNumber(amount) {
  const container = document.getElementById("animated-numbers-container");
  const numberElement = document.createElement("div");
  numberElement.classList.add("animated-number");
  numberElement.textContent = `+${amount}`;
  container.appendChild(numberElement);

  setTimeout(() => {
    numberElement.remove();
  }, 1000);
}

function getMultiplier(level) {
  const BASE_MULTIPLIER = 1;
  return 1 + (level - 1) * BASE_MULTIPLIER;
}

document.getElementById("cobrar-boleto").addEventListener("click", () => {
  if (isInitialState) {
    isInitialState = false; // Desactivar el flag después de la primera interacción
  }
  counterSubject.increment();
});

document.getElementById("contratar-chofer").addEventListener("click", function () {
  if (!this.classList.contains("purchased")) {
    if (counterSubject.purchaseButton("contratar-chofer", 100)) {
      if (isInitialState) {
        isInitialState = false; // Desactivar el flag después de la primera interacción
      }
      // Activar el incremento automático
      const level = counterSubject.buttonLevels["contratar-chofer"];
      const multiplier = counterSubject.busMultiplier * counterSubject.choferMultiplier;
      const intervalTime = 1000 / level;
      counterSubject.intervalId = setInterval(() => {
        const amount = Math.round(multiplier);
        createAnimatedNumber(amount);
        counterSubject.counter = Math.round(counterSubject.counter + multiplier);
        counterSubject.notifyObservers();
        saveGameState(counterSubject); // Guardar el estado durante el incremento automático
      }, intervalTime);

      // Actualizar el botón
      this.classList.remove("blocked");
      this.classList.add("purchased");
      this.disabled = false;
      this.textContent = "¡Chofer contratado!";
      this.style.backgroundColor = "#90caf9";
    } else {
      mostrarNotificacion("¡No tienes suficientes puntos para contratar al chofer!");
    }
  }
});


document.getElementById("siguiente-parada").addEventListener("click", function() {
  if (!this.classList.contains("purchased")) {
    purchaseButton("siguiente-parada", 1000);
  } else {
    counterSubject.startProgressBar((multiplier) => {
      counterSubject.counter = Math.round(counterSubject.counter + 100 * multiplier);
      counterSubject.notifyObservers();
    });
  }
});



document.querySelectorAll(".upgrade-button").forEach(button => {
  button.addEventListener("click", function() {
    const targetButtonId = this.getAttribute("data-target");
    const cost = parseInt(this.getAttribute("data-cost"), 10);
    upgradeButton(targetButtonId, cost);
  });
});

document.getElementById("mejorar-bus").addEventListener("click", upgradeBus);

document.getElementById("mejorar-chofer").addEventListener("click", function () {
  const cost = counterSubject.choferUpgradeCost;
  if (counterSubject.upgradeChofer(cost)) {
    const choferImage = document.getElementById("chofer-image");
    choferImage.src = `/img/chofer${counterSubject.choferLevel}.jpg`;

    const mejorarChoferButton = document.getElementById("mejorar-chofer");
    if (counterSubject.choferLevel < counterSubject.choferMaxLevel) {
      // Formatear el costo correctamente
      mejorarChoferButton.textContent = `Mejorar chofer (Costo: ${formatNumber(counterSubject.choferUpgradeCost)})`;
    } else {
      mejorarChoferButton.textContent = "Chofer a nivel máximo";
      mejorarChoferButton.disabled = true;
    }

    mostrarNotificacion("¡Chofer mejorado! Multiplicador de pasajeros por segundo aumentado.");
  } else if (counterSubject.choferLevel >= counterSubject.choferMaxLevel) {
    mostrarNotificacion("¡El chofer ya está en su nivel máximo!");
  } else {
    mostrarNotificacion("¡No tienes suficientes puntos para mejorar al chofer!");
  }
});

function formatNumber(num) {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)} trillones`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)} billones`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)} millones`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)} mil`;
  return num;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "b" || event.key === "B") {
    counterSubject.counter += 100000;
    counterSubject.notifyObservers();
    mostrarNotificacion("¡100,000 puntos agregados!");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "n" || event.key === "N") {
    counterSubject.counter = 0;
    counterSubject.notifyObservers();
    mostrarNotificacion("¡Puntos reseteados!");
  }
});

function startRandomEvent() {
  const events = [
    { message: "¡Vendedor ambulante se sube al bondi! (+100)", bonus: 100 },
    { message: "¡Un billete entra volando por la ventanilla! (+100)", bonus: 100 },
    { message: "¡Cobras de más sin querer (queriendo)! (+100)", bonus: 100 },
    { message: "¡Atrapas a un punga! (+100)", bonus: 100 },
    { message: "¡Es tu cumpleaños, los de siempre te hacen un regalo! (+100)", bonus: 100 },
    { message: "¡Ayudás a un turista perdido por el conurbano y te da una propina! (+100)", bonus: 100 },
    { message: "¡Encontraste monedas en los asientos! (+100)", bonus: 100 },
    { message: "¡Un pasajero te invita un alfajor! (+100)", bonus: 100 },
    { message: "¡Vendedor ambulante se sube al bondi! (+100)", bonus: 100 },
    { message: "¡Un billete entra volando por la ventanilla! (+100)", bonus: 100 },
    { message: "¡Cobras de más sin querer (queriendo)! (+100)", bonus: 100 },
    { message: "¡Atrapas a un punga! (+100)", bonus: 100 },
    { message: "¡Es tu cumpleaños, los de siempre te hacen un regalo! (+100)", bonus: 100 },
    { message: "¡Ayudás a un turista perdido por el conurbano y te da una propina! (+100)", bonus: 100 },
    { message: "¡Encontraste monedas en los asientos! (+100)", bonus: 100 },
    { message: "¡Un pasajero te invita un alfajor! (+100)", bonus: 100 },
    { message: "¡Vendedor ambulante se sube al bondi! (+100)", bonus: 100 },
    { message: "¡Un billete entra volando por la ventanilla! (+100)", bonus: 100 },
    { message: "¡Cobras de más sin querer (queriendo)! (+100)", bonus: 100 },
    { message: "¡Atrapas a un punga! (+100)", bonus: 100 },
    { message: "¡Es tu cumpleaños, los de siempre te hacen un regalo! (+100)", bonus: 100 },
    { message: "¡Ayudás a un turista perdido por el conurbano y te da una propina! (+100)", bonus: 100 },
    { message: "¡Encontraste monedas en los asientos! (+100)", bonus: 100 },
    { message: "¡Un pasajero te invita un alfajor! (+100)", bonus: 100 },
    { message: "¡Vendedor ambulante se sube al bondi! (+100)", bonus: 100 },
    { message: "¡Un billete entra volando por la ventanilla! (+100)", bonus: 100 },
    { message: "¡Cobras de más sin querer (queriendo)! (+100)", bonus: 100 },
    { message: "¡Atrapas a un punga! (+100)", bonus: 100 },
    { message: "¡Es tu cumpleaños, los de siempre te hacen un regalo! (+100)", bonus: 100 },
    { message: "¡Ayudás a un turista perdido por el conurbano y te da una propina! (+100)", bonus: 100 },
    { message: "¡Encontraste monedas en los asientos! (+100)", bonus: 100 },
    { message: "¡Un pasajero te invita un alfajor! (+100)", bonus: 100 },

    { message: "¡Encontrás una billetera llena de guita! (+5000)", bonus: 5000 },

    { message: "¡Un canguro te roba por Plaza Constitución!(-50)", penalty: -50 },
    { message: "¡El bondi se llevó puesto un pozo! (-50)", penalty: -50 },
    { message: "¡Un pasajero se mareó y vomitó en el bondi! (-50)", penalty: -50 },
    { message: "¡Casi atropeyas a un anciano! (-50)", penalty: -50 },
    { message: "¡Multa por exceso de velocidad! (-50)", penalty: -50 },
    { message: "¡Un pasajero se subió sin pagar! (-50)", penalty: -50 },
    { message: "¡Un pasajero te pidió direcciones y te hizo perder tiempo! (-50)", penalty: -50 },
    { message: "¡Un pasajero se quejó de la música que ponés! (-50)", penalty: -50 },
    { message: "¡El mate te hizo mal y debés ir al baño! (-50)", penalty: -50 },
    { message: "¡Manifestaciones por Avenida Yrigoyen! (-50)", penalty: -50 },
    { message: "¡Vas demasiado rápido! (-50)", penalty: -50 },
    { message: "¡Le rompés un espejo a un auto! (-50)", penalty: -50 },
    { message: "¡Pasás en rojo! (-50)", penalty: -50 },
    { message: "¡Un canguro te roba por Plaza Constitución!(-50)", penalty: -50 },
    { message: "¡El bondi se llevó puesto un pozo! (-50)", penalty: -50 },
    { message: "¡Un pasajero se mareó y vomitó en el bondi! (-50)", penalty: -50 },
    { message: "¡Casi atropeyas a un anciano! (-50)", penalty: -50 },
    { message: "¡Multa por exceso de velocidad! (-50)", penalty: -50 },
    { message: "¡Un pasajero se subió sin pagar! (-50)", penalty: -50 },
    { message: "¡Un pasajero te pidió direcciones y te hizo perder tiempo! (-50)", penalty: -50 },
    { message: "¡Un pasajero se quejó de la música que ponés! (-50)", penalty: -50 },
    { message: "¡El mate te hizo mal y debés ir al baño! (-50)", penalty: -50 },
    { message: "¡Manifestaciones por Avenida Yrigoyen! (-50)", penalty: -50 },
    { message: "¡Vas demasiado rápido! (-50)", penalty: -50 },
    { message: "¡Le rompés un espejo a un auto! (-50)", penalty: -50 },
    { message: "¡Pasás en rojo! (-50)", penalty: -50 },

    { message: "¡Chocás un auto de lujo! (-5000)", penalty: -5000 },

    { message: "¡Hoy juega Racing! Doble de pasajeros por 30 segundos.", multiplier: 2, duration: 30000 },
    { message: "¡La linea Roca está interrumpida! Doble de pasajeros por 30 segundos.", multiplier: 2, duration: 30000 },
    { message: "¡Un influencer se sube al bondi y lo transmite en redes! Doble de pasajeros por 30 segundos.", multiplier: 2, duration: 30000 },
    { message: "¡Paro de Subtes! Doble de pasajeros por 30 segundos.", multiplier: 2, duration: 30000 }
    ,
    { message: "¡Un pasajero te dice que maneja mejor que vos! (No sucede nada)", bonus: 0 },
    { message: "¡Se subió Adrián Dárgelos! (No sucede nada)", bonus: 0 },
    { message: "¡Un pasajero se sube con un mate y no te ofrece! (No sucede nada)", bonus: 0 },
    { message: "¡Un pasajero se te sienta al lado con el bondi vacío! (No sucede nada)", bonus: 0 },
    { message: "¡Un anciano te cuenta su vida! (No sucede nada)", bonus: 0 },
    
    { message: "¡Un bondi trucho se te adelanta! Mitad de pasajeros por 30 segundos", penalty: "half", duration: 30000 },
    { message: "¡Fisura se pone a rapear por dinero! Mitad de pasajeros por 30 segundos", penalty: "half", duration: 30000 },
    { message: "¡Demasiado tráfico llegando a Catán! Mitad de pasajeros por 30 segundos", penalty: "half", duration: 30000 },
  ];

  const randomEvent = events[Math.floor(Math.random() * events.length)];

  mostrarNotificacion(randomEvent.message);

  if (randomEvent.bonus) {
    // Aplicar bonificación
    counterSubject.counter += randomEvent.bonus;
    counterSubject.notifyObservers();
    saveGameState(counterSubject); // Guardar el estado después de la bonificación
  } else if (randomEvent.penalty && randomEvent.penalty !== "half") {
    // Aplicar penalización (como -50)
    counterSubject.counter -= randomEvent.penalty;
    counterSubject.notifyObservers();
    saveGameState(counterSubject); // Guardar el estado después de la penalización
  } else if (randomEvent.penalty === "half") {
    // Aplicar penalización de "mitad de ganancias"
    const originalMultiplier = counterSubject.busMultiplier;
    counterSubject.busMultiplier *= 0.5; // Reduce las ganancias a la mitad
    setTimeout(() => {
      counterSubject.busMultiplier = originalMultiplier; // Restaura el multiplicador original
      counterSubject.notifyObservers();
      saveGameState(counterSubject); // Guardar el estado después de restaurar el multiplicador
    }, randomEvent.duration);
  } else if (randomEvent.multiplier) {
    const originalMultiplier = counterSubject.busMultiplier;
    counterSubject.busMultiplier *= randomEvent.multiplier;
    setTimeout(() => {
      counterSubject.busMultiplier = originalMultiplier;
      counterSubject.notifyObservers();
      saveGameState(counterSubject); // Guardar el estado después de restaurar el multiplicador
    }, randomEvent.duration);
  }
}

// Lanzar un evento aleatorio cada 30 segundos
setInterval(startRandomEvent, 30000);

function resetGame() {
  localStorage.removeItem('gameState');
  isInitialState = true; // Marcar el estado como inicial
  location.reload(); // Recargar la página para reiniciar el juego
}

document.getElementById("reset-button").addEventListener("click", () => {
  if(confirm('¿Seguro querés eliminar todo el progreso?')) {
    resetGame()
  }});



  
