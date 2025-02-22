const gameTitle = "Bondi Clicker",
      gameVersion = "0.0.7";

// Limpiar localstorage si hay un cambio de versión, evita conflictos
const storedVersion = localStorage.getItem("appVersion");

if (storedVersion !== gameVersion) {
  localStorage.clear();
  localStorage.setItem("appVersion", gameVersion);
}

const cobrarBoletoText = "Cobrar Boleto",
      contratarChoferText = "Desbloquear (Costo: 100)",
      siguienteParadaText = "Desbloquear (Costo: 1.000)",
      busCostaText = "Desbloquear (Costo: 15.000)";

let isInitialState = true; // Bandera para controlar el estado inicial

document.addEventListener("DOMContentLoaded", () => {
  // Si existen datos en localstorage, los cargo
  const savedState = localStorage.getItem("gameState");
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
    counterSubject.busUpgradeCost = 50000;
    counterSubject.choferMultiplier = 1;
    counterSubject.choferUpgradeCost = 10000;
    counterSubject.choferLevel = 1;
    counterSubject.terminalLevel = 1;
    counterSubject.terminalMultiplier = 1;
    counterSubject.terminalUpgradeCost = 50000000;
  }

  updateButtonStyles();
  updateParadaButton();
  updateBusCostaButton();
  //loadGameState(counterSubject);  // Cargar el estado del juego y otras inicializaciones
  counterSubject.notifyObservers();
  counterSubject.notifyProgress();
  counterSubject.notifyBusCostaProgress();

  document.querySelector("#siguiente-parada-fill").style = "background-color:#1976d2";
  document.querySelector("#bus-costa-fill").style = "background-color:#1976d2";

  // Asignar el título y la versión
  const titleElement = document.querySelector("h1");
  titleElement.innerHTML = `${gameTitle} <span style="font-size: 1rem; font-family: Arial, Helvetica, sans-serif;">${gameVersion}</span>`;

  // Asignar los textos de los botones
  document.getElementById("cobrar-boleto").textContent = cobrarBoletoText;
  document.getElementById("contratar-chofer").textContent = contratarChoferText;
  document.getElementById("siguiente-parada").textContent = siguienteParadaText;
  document.getElementById("bus-costa").textContent = busCostaText;
  document.getElementById("mejorar-bus").textContent = document.querySelector(
    "#mejorar-bus"
  ).textContent = `Mejorar bondi (Costo: ${formatNumber(
    counterSubject.busUpgradeCost
  )})`;
  document.getElementById("mejorar-chofer").textContent =
    document.querySelector(
      "#mejorar-chofer"
    ).textContent = `Mejorar chofer (Costo: ${formatNumber(
      counterSubject.choferUpgradeCost
    )})`;
  document.getElementById("mejorar-terminal").textContent =
    document.querySelector(
      "#mejorar-terminal"
    ).textContent = `Mejorar terminal (Costo: ${formatNumber(
      counterSubject.terminalUpgradeCost
    )})`;

  // Mapa Modal
  setupModal("mapa-modal", "mapa");

  // Ascender Modal
  setupModal("ascender-modal", "ascender");

  // Info Modals with dynamic text
  setupInfoModal("info-modal", "bus-info", () => 
    `Lvl${counterSubject.busLevel} | Aumenta la velocidad de viaje considerablemente`
  );
  setupInfoModal("info-modal", "chofer-info", () => 
    `Lvl${counterSubject.choferLevel} | El chofer recoge cada vez más pasajeros`
  );
  setupInfoModal("info-modal", "terminal-info", () => 
    `Lvl${counterSubject.terminalLevel} | Más bondis, más choferes`
  );
  setupInfoModal("info-modal", "casino-info", () => 
    `¡Probabilidad de victoria: 50%!`
  );

  // Asignar las imágenes
  document.getElementById(
    "bus-image"
  ).src = `img/bus${counterSubject.busLevel}.jpg`;
  document.getElementById(
    "chofer-image"
  ).src = `/img/chofer${counterSubject.choferLevel}.jpg`;
  document.getElementById(
    "terminal-image"
  ).src = `img/terminal${counterSubject.terminalLevel}.jpg`;
  document.getElementById("casino-image").src = `/img/casino.jpg`;

  // Actualizar niveles de botones, bus y chofer
  Object.keys(counterSubject.buttonLevels).forEach((buttonId) => {
    const levelDisplay = document.getElementById(`${buttonId}-level`);
    if (levelDisplay) {
      levelDisplay.textContent = `Nivel ${counterSubject.buttonLevels[buttonId]}`;
    }
  });

  // Si el chofer ya estaba contratado, actualizar el botón
  if (counterSubject.purchasedButtons.has("contratar-chofer")) {
    const contratarChoferButton = document.getElementById("contratar-chofer");
    contratarChoferButton.textContent = "¡Chofer contratado!";
    contratarChoferButton.style.backgroundColor = "#9e9e9e";
    contratarChoferButton.disabled = true;
  }

  // Actualizar el botón "Siguiente Parada" al inicio del juego
  const siguienteParadaButton = document.getElementById("siguiente-parada");
  if (siguienteParadaButton) {
    if (counterSubject.purchasedButtons.has("siguiente-parada")) {
      // Si ya está comprado, mostrar el texto normal
      siguienteParadaButton.textContent = "Conducir a la siguiente parada";
      siguienteParadaButton.classList.remove("blocked");
      siguienteParadaButton.classList.add("purchased");
      siguienteParadaButton.disabled = false;
    } else {
      // Si no está comprado, mostrar el texto de desbloqueo
      siguienteParadaButton.textContent = "Desbloquear (Costo: 1.000)";
      siguienteParadaButton.classList.add("blocked");
      siguienteParadaButton.disabled = true;
    }
  }

  // Si viajar a la costa esta comprado, actualizar el botón
  if (counterSubject.purchasedButtons.has("bus-costa")) {
    const busCostaButton = document.getElementById("bus-costa");
    busCostaButton.textContent = "Viajar a la costa";
  }

  // Actualizar upgrades de bondi
  if (counterSubject.busLevel >= 10) {
    const busUpgradeButton = document.querySelector("#mejorar-bus");
    busUpgradeButton.textContent = "Bondi a nivel máximo";
    busUpgradeButton.classList.add("gold");
    busUpgradeButton.classList.remove("purchasable");
  }

  // Actualizar upgrades de chofer
  if (counterSubject.choferLevel >= 5) {
    const choferUpgradeButton = document.querySelector("#mejorar-chofer");
    choferUpgradeButton.textContent = "Chofer a nivel máximo";
    choferUpgradeButton.classList.add("gold");
    choferUpgradeButton.classList.remove("purchasable");
  }

  // Actualizar upgrades de la terminal
  if (counterSubject.terminalLevel >= 3) {
    const terminalUpgradeButton = document.querySelector("#mejorar-terminal");
    terminalUpgradeButton.textContent = "Terminal a nivel máximo";
    terminalUpgradeButton.classList.add("gold");
    terminalUpgradeButton.classList.remove("purchasable");
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
    terminalLevel: subject.terminalLevel,
    terminalMultiplier: subject.terminalMultiplier,
    terminalUpgradeCost: subject.terminalUpgradeCost,
    buttonTexts: {
      "cobrar-boleto": document.getElementById("cobrar-boleto").textContent,
      "contratar-chofer":
        document.getElementById("contratar-chofer").textContent,
      "siguiente-parada":
        document.getElementById("siguiente-parada").textContent,
      "bus-costa": document.getElementById("bus-costa").textContent,
      "mejorar-bus": document.getElementById("mejorar-bus").textContent,
      "mejorar-chofer": document.getElementById("mejorar-chofer").textContent,
    },
    buttonUpgradeCosts: subject.buttonUpgradeCosts,
    purchasedStops: Array.from(
      document.querySelectorAll(".mapa-purchased")
    ).map((stop) => stop.id), // Guardar las paradas compradas
  };
  localStorage.setItem("gameState", JSON.stringify(gameState));
}

function loadGameState(subject) {
  const savedState = localStorage.getItem("gameState");
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
    subject.terminalLevel = gameState.terminalLevel || 1; // Cargar el nivel de la terminal (valor por defecto 1 si no existe)
    subject.terminalMultiplier = gameState.terminalMultiplier || 1; // Cargar el multiplicador de la terminal (valor por defecto 1 si no existe)
    subject.terminalUpgradeCost = gameState.terminalUpgradeCost || 50000000; // Cargar el costo de mejora de la terminal (valor por defecto 50000000 si no existe)
    subject.buttonUpgradeCosts = gameState.buttonUpgradeCosts || {
      // Cargar los costos de mejora
      "cobrar-boleto": 50,
      "contratar-chofer": 50,
      "siguiente-parada": 50,
      "bus-costa": 50,
    };
    subject.purchasedStops = new Set(gameState.purchasedStops || []);

    // Restaurar las paradas compradas en la UI
    gameState.purchasedStops.forEach((stopId) => {
      const stopElement = document.getElementById(stopId);
      if (stopElement) {
        stopElement.classList.add("mapa-purchased");
        stopElement.textContent = getStopName(stopId); // Función para obtener el nombre de la parada
      }
    });

    // Actualizar el paisaje según la última parada comprada
    const lastStop =
      gameState.purchasedStops[gameState.purchasedStops.length - 1];
    if (lastStop) {
      paisaje.classList.add(lastStop);
      porcentaje.textContent = getStopPercentage(lastStop); // Función para obtener el porcentaje
    }

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

    if (gameState.buttonTexts) {
      Object.keys(gameState.buttonTexts).forEach((buttonId) => {
        const button = document.getElementById(buttonId);
        if (button) {
          button.textContent = gameState.buttonTexts[buttonId];
        }
      });
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
    this.purchasedStops = new Set();
    this.buttonLevels = {
      "cobrar-boleto": 1,
      "contratar-chofer": 1,
      "siguiente-parada": 1,
      "bus-costa": 1,
    };
    this.busLevel = 1;
    this.busMultiplier = 1;
    this.busUpgradeCost = 50000;
    this.choferMultiplier = 1;
    this.choferUpgradeCost = 10000;
    this.choferUpgradePercentage = 5; // multiplicador de pasajeros por segundo
    this.choferLevel = 1;
    this.choferMaxLevel = 5;
    this.terminalMultiplier = 1;
    this.terminalUpgradeCost = 50000000;
    this.terminalUpgradePercentage = 0.1;
    this.terminalLevel = 1;
    this.terminalMaxLevel = 3;
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
    this.observers.forEach((observer) => observer.update(this.counter));
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
      const multiplier = this.choferMultiplier * this.terminalMultiplier;
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
        this.progress = 0; // Reiniciar el progreso
        const amount = Math.round(100 * multiplier);
        createAnimatedNumber(amount);
        this.counter = Math.round(this.counter + 100 * multiplier);
        callback(multiplier);
        saveGameState(this); // Guardar el estado después de completar la barra de progreso

        // Restaurar el botón "Siguiente Parada" a su estado normal
        const siguienteParadaButton =
          document.getElementById("siguiente-parada");
        if (siguienteParadaButton) {
          siguienteParadaButton.textContent = "Conducir a la siguiente parada";
          siguienteParadaButton.style.backgroundColor = "#1976d2"; // Azul
        }
      }
      this.notifyProgress();
    }, 240 / (this.busMultiplier * 2 + this.terminalMultiplier));
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
    }, 1000 / (this.busMultiplier * 3 + this.terminalMultiplier * 3));
  }

  claimBusCostaReward() {
    if (this.busCostaReady) {
      const level = this.buttonLevels["bus-costa"];
      const multiplier =
        getMultiplier(level) *
        (this.busMultiplier * 5) *
        (this.terminalMultiplier * 2);
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
      this.busMultiplier *= 1.3;
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
      this.choferMultiplier *= 1 + this.choferUpgradePercentage;
      this.choferUpgradeCost *= 2; // Duplicar el costo para el próximo nivel
      this.choferLevel += 1;
      saveGameState(this); // Guardar el estado después de mejorar al chofer

      if (this.intervalId) {
        this.restartIncrementPerSecond();
      }

      this.notifyObservers();
      return true;
    } else if (this.choferLevel >= this.choferMaxLevel) {
      mostrarNotificacion("¡El chofer ya está en su nivel máximo!");
      return false;
    }
    return false;
  }

  upgradeTerminal(cost) {
    if (this.counter >= cost && this.terminalLevel < this.terminalMaxLevel) {
      this.counter -= cost;
      this.terminalMultiplier *= 5;
      this.terminalUpgradeCost *= 10; // Duplicar el costo para el próximo nivel
      this.terminalLevel += 1;
      saveGameState(this); // Guardar el estado después de mejorar al chofer
      this.notifyObservers();
      return true;
    } else if (this.terminalLevel >= this.terminalMaxLevel) {
      mostrarNotificacion("¡La terminal ya está en su nivel máximo!");
      return false;
    }
    return false;
  }

  lostChofer() {
    this.choferMultiplier = 1;
    this.choferUpgradeCost = 10000;
    //this.choferUpgradePercentage = 0.1;
    this.choferLevel = 1;
    //this.choferMaxLevel = 5;
    saveGameState(this); // Guardar el estado después de mejorar al chofer
    this.notifyObservers();
    return true;
  }

  lostBondi() {
    this.busMultiplier = 1;
    this.busUpgradeCost = 50000;
    //this.choferUpgradePercentage = 0.1;
    this.busLevel = 1;
    //this.choferMaxLevel = 5;
    saveGameState(this); // Guardar el estado después de mejorar al chofer
    this.notifyObservers();
    return true;
  }

  lostTerminal() {
    this.terminalMultiplier = 1;
    this.terminalUpgradeCost = 50000000;
    //this.terminalUpgradePercentage = 0.1;
    this.terminalLevel = 1;
    //this.terminalMaxLevel = 3;
    saveGameState(this); // Guardar el estado después de mejorar al chofer
    this.notifyObservers();
    return true;
  }

  gainBondi() {
    if (this.busLevel < 10) {
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
  }

  gainChofer() {
    if (this.choferLevel < 5) {
      this.choferMultiplier *= 1 + this.choferUpgradePercentage;
      this.choferUpgradeCost *= 2; // Duplicar el costo para el próximo nivel
      this.choferLevel += 1;
      saveGameState(this); // Guardar el estado después de mejorar al chofer
      this.notifyObservers();
      return true;
    }
  }

  gainTerminal() {
    if (this.terminalLevel < 3) {
      this.terminalMultiplier *= 1 + this.choferUpgradePercentage;
      this.terminalUpgradeCost *= 2; // Duplicar el costo para el próximo nivel
      this.terminalLevel += 1;
      saveGameState(this); // Guardar el estado después de mejorar al chofer
      this.notifyObservers();
      return true;
    }
  }

  notifyProgress() {
    this.observers.forEach((observer) =>
      observer.updateProgress(this.progress)
    );
  }

  notifyBusCostaProgress() {
    this.observers.forEach((observer) =>
      observer.updateBusCostaProgress(this.busCostaProgress)
    );
  }
}

class Observer {
  constructor(
    updateFunction,
    updateProgressFunction,
    updateBusCostaProgressFunction
  ) {
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
    document.getElementById("counter-display").textContent =
      formatNumber(newValue);
  },
  (newProgress) => {
    document.getElementById(
      "siguiente-parada-fill"
    ).style.width = `${newProgress}%`;
    document.getElementById(
      "siguiente-parada-fill"
    ).textContent = `${newProgress}%`;
  },
  (newProgress) => {
    document.getElementById("bus-costa-fill").style.width = `${newProgress}%`;
    document.getElementById("bus-costa-fill").textContent = `${newProgress}%`;
  }
);

counterSubject.addObserver(displayObserver);

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
    mostrarNotificacion(
      "¡No tenés suficientes pasajeros para comprar esta mejora!"
    );
  }
}

function upgradeButton(buttonId, cost) {
  if (counterSubject.upgradeButton(buttonId, cost)) {
    const levelDisplay = document.getElementById(`${buttonId}-level`);
    const newLevel = counterSubject.buttonLevels[buttonId];
    levelDisplay.textContent = `Nivel ${newLevel}`;
    updateButtonStyles(); // Actualizar los estilos de los botones
    counterSubject.notifyObservers(); // Notificar a los observadores para actualizar la UI
  } else {
    mostrarNotificacion(
      "¡No tenés suficientes pasajeros para comprar esta mejora!"
    );
  }
}

function upgradeItem(itemName, itemType, cost, maxLevel, multiplierProperty, upgradeCostProperty, levelProperty, imageElementId, upgradeButtonId, notificationMessage) {
  if (counterSubject[levelProperty] >= maxLevel) {
    mostrarNotificacion(`¡El ${itemType} ya está en su nivel máximo!`);
    return false;
  }

  if (counterSubject.counter >= cost) {
    counterSubject.counter -= cost;
    counterSubject[levelProperty] += 1;
    counterSubject[multiplierProperty] *= 1.3; // Ajusta el multiplicador según sea necesario
    counterSubject[upgradeCostProperty] *= 2; // Duplica el costo para el próximo nivel

    // Actualizar la imagen si existe
    const imageElement = document.getElementById(imageElementId);
    if (imageElement) {
      imageElement.src = `img/${itemType}${counterSubject[levelProperty]}.jpg`;
    }

    // Actualizar el botón de mejora
    const upgradeButton = document.getElementById(upgradeButtonId);
    if (upgradeButton) {
      if (counterSubject[levelProperty] < maxLevel) {
        upgradeButton.textContent = `Mejorar ${itemName} (Costo: ${formatNumber(counterSubject[upgradeCostProperty])})`;
      } else {
        upgradeButton.textContent = `${itemName} a nivel máximo`;
        upgradeButton.classList.add("gold");
        upgradeButton.classList.remove("purchasable");
      }
    }

    mostrarNotificacion(notificationMessage);
    saveGameState(counterSubject);
    counterSubject.notifyObservers();
    return true;
  } else {
    mostrarNotificacion(`¡No tenés suficientes pasajeros para mejorar el ${itemType}!`);
    return false;
  }
}

function upgradeBus() {
  upgradeItem(
    "Bondi",
    "bus",
    counterSubject.busUpgradeCost,
    10,
    "busMultiplier",
    "busUpgradeCost",
    "busLevel",
    "bus-image",
    "mejorar-bus",
    "¡Bondi mejorado!"
  );
}

function upgradeChofer() {
  upgradeItem(
    "Chofer",
    "chofer",
    counterSubject.choferUpgradeCost,
    5,
    "choferMultiplier",
    "choferUpgradeCost",
    "choferLevel",
    "chofer-image",
    "mejorar-chofer",
    "¡Chofer mejorado!"
  );
}

function upgradeTerminal() {
  upgradeItem(
    "Terminal",
    "terminal",
    counterSubject.terminalUpgradeCost,
    3,
    "terminalMultiplier",
    "terminalUpgradeCost",
    "terminalLevel",
    "terminal-image",
    "mejorar-terminal",
    "¡Terminal mejorada!"
  );
}

function gainEntity(entityConfig) {
  const {
    counterSubject,
    entityType,
    maxLevel,
    imageId,
    buttonId,
    upgradeCostProp,
    levelProp,
    imagePath,
  } = entityConfig;

  if (counterSubject[entityType]()) { // Llama a la función específica (gainBondi, gainChofer, gainTerminal)
    // Actualizar la imagen
    const entityImage = document.getElementById(imageId);
    entityImage.src = `${imagePath}${counterSubject[levelProp]}.jpg`;

    // Actualizar el botón
    const upgradeButton = document.getElementById(buttonId);
    if (counterSubject[levelProp] < maxLevel) {
      upgradeButton.textContent = `Mejorar ${entityType} (Costo: ${formatNumber(
        counterSubject[upgradeCostProp]
      )})`;
    } else {
      upgradeButton.textContent = `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} a nivel máximo`;
      upgradeButton.classList.add("gold");
      upgradeButton.classList.remove("purchasable");
      // upgradeButton.disabled = true; // Descomentar si lo necesitas
    }

    // Guardar estado y notificar
    saveGameState(counterSubject);
    if (entityType !== "gainBondi") { // Solo gainBondi no notifica observadores en el original
      counterSubject.notifyObservers();
    }
  } else if (counterSubject[levelProp] >= maxLevel) {
    mostrarNotificacion(`¡El ${entityType.replace("gain", "").toLowerCase()} ya está en su nivel máximo!`);
  } else {
    mostrarNotificacion(
      `¡No tenés suficientes pasajeros para mejorar ${entityType.replace("gain", "el ").toLowerCase()}!`
    );
  }
}

// Configuraciones para cada entidad
const entityConfigs = {
  bondi: {
    counterSubject: counterSubject,
    entityType: "gainBondi",
    maxLevel: 10,
    imageId: "bus-image",
    buttonId: "mejorar-bus",
    upgradeCostProp: "busUpgradeCost",
    levelProp: "busLevel",
    imagePath: "img/bus",
  },
  chofer: {
    counterSubject: counterSubject,
    entityType: "gainChofer",
    maxLevel: 5,
    imageId: "chofer-image",
    buttonId: "mejorar-chofer",
    upgradeCostProp: "choferUpgradeCost",
    levelProp: "choferLevel",
    imagePath: "img/chofer",
  },
  terminal: {
    counterSubject: counterSubject,
    entityType: "gainTerminal",
    maxLevel: 3,
    imageId: "terminal-image",
    buttonId: "mejorar-terminal",
    upgradeCostProp: "terminalUpgradeCost",
    levelProp: "terminalLevel",
    imagePath: "img/terminal",
  },
};

// Uso de la función refactorizada
function gainBondi() {
  gainEntity(entityConfigs.bondi);
}

function gainChofer() {
  gainEntity(entityConfigs.chofer);
}

function gainTerminal() {
  gainEntity(entityConfigs.terminal);
}

function lostEntity(entityConfig) {
  const {
    counterSubject,
    entityType,
    maxLevel,
    imageId,
    buttonId,
    upgradeCostProp,
    levelProp,
    imagePath,
  } = entityConfig;

  if (counterSubject[entityType]()) { // Llama a la función específica (lostBondi, lostChofer, lostTerminal)
    // Actualizar la imagen
    const entityImage = document.getElementById(imageId);
    entityImage.src = `${imagePath}${counterSubject[levelProp]}.jpg`;

    // Actualizar el botón
    const upgradeButton = document.getElementById(buttonId);
    if (counterSubject[levelProp] < maxLevel) {
      upgradeButton.textContent = `Mejorar ${entityType.replace("lost", "").toLowerCase()} (Costo: ${formatNumber(
        counterSubject[upgradeCostProp]
      )})`;
      upgradeButton.classList.remove("gold");
      upgradeButton.classList.add("purchasable");
    } else {
      upgradeButton.textContent = `${entityType.replace("lost", "").charAt(0).toUpperCase() + entityType.replace("lost", "").slice(1)} a nivel máximo`;
      upgradeButton.classList.add("gold");
      upgradeButton.classList.remove("purchasable");
      // upgradeButton.disabled = true; // Descomentar si lo necesitas
    }

    // Guardar estado y notificar
    saveGameState(counterSubject);
    counterSubject.notifyObservers(); // Notificar a los observadores
  } else if (counterSubject[levelProp] >= maxLevel) {
    mostrarNotificacion(`¡El ${entityType.replace("lost", "").toLowerCase()} ya está en su nivel máximo!`);
  } else {
    mostrarNotificacion(
      `¡No tenés suficientes pasajeros para mejorar ${entityType.replace("lost", "el ").toLowerCase()}!`
    );
  }
}

// Configuraciones para cada entidad
const entityDowngradeConfigs = {
  bondi: {
    counterSubject: counterSubject,
    entityType: "lostBondi",
    maxLevel: 10,
    imageId: "bus-image",
    buttonId: "mejorar-bus",
    upgradeCostProp: "busUpgradeCost",
    levelProp: "busLevel",
    imagePath: "img/bus",
  },
  chofer: {
    counterSubject: counterSubject,
    entityType: "lostChofer",
    maxLevel: 5,
    imageId: "chofer-image",
    buttonId: "mejorar-chofer",
    upgradeCostProp: "choferUpgradeCost",
    levelProp: "choferLevel",
    imagePath: "img/chofer",
  },
  terminal: {
    counterSubject: counterSubject,
    entityType: "lostTerminal",
    maxLevel: 3,
    imageId: "terminal-image",
    buttonId: "mejorar-terminal",
    upgradeCostProp: "terminalUpgradeCost",
    levelProp: "terminalLevel",
    imagePath: "img/terminal",
  },
};

// Uso de la función refactorizada
function lostBondi() {
  lostEntity(entityDowngradeConfigs.bondi);
}

function lostChofer() {
  lostEntity(entityDowngradeConfigs.chofer);
}

function lostTerminal() {
  lostEntity(entityDowngradeConfigs.terminal);
}

function updateParadaButton() {
  const paradaButton = document.getElementById("siguiente-parada");
  if (paradaButton) {
    if (counterSubject.progress > 0 && counterSubject.progress < 100) {
      // Cuando el progreso está en curso, el botón debe estar en gris
      paradaButton.style.backgroundColor = "grey";
      paradaButton.textContent = "Viajando...";
    } else if (counterSubject.purchasedButtons.has("siguiente-parada")) {
      // Cuando no hay progreso y el botón está comprado, mostrar el texto normal
      paradaButton.style.backgroundColor = "#1976d2"; // Azul
      paradaButton.textContent = "Conducir a la siguiente parada";
    } else {
      // Cuando no hay progreso y el botón no está comprado, mostrar el texto de desbloqueo
      // paradaButton.style.backgroundColor = "#9e9e9e"; // Gris
      paradaButton.textContent = "Desbloquear (Costo: 1.000)";
    }
  }
}

counterSubject.addObserver(
  new Observer(
    () => {},
    () => {
      updateParadaButton(); // Actualizar el botón cuando el progreso cambie
    },
    () => {}
  )
);

function updateBusCostaButton() {
  const busCostaButton = document.getElementById("bus-costa");
  if (counterSubject.busCostaReady) {
    // Cuando el progreso está completo, el botón debe estar en azul
    busCostaButton.classList.add("ready");
    busCostaButton.style.backgroundColor = "#1976d2"; // Azul
    busCostaButton.textContent = "Cobrar viaje";
  } else if (
    counterSubject.busCostaProgress > 0 &&
    counterSubject.busCostaProgress < 100
  ) {
    // Cuando el progreso está en curso, el botón debe estar en gris
    busCostaButton.style.backgroundColor = "grey";
    busCostaButton.textContent = "Viajando...";
  } else {
    // Cuando no hay progreso, el botón debe estar en azul
    //busCostaButton.style.backgroundColor = "#1976d2"; // Azul
    //busCostaButton.textContent = "Desbloquear (Costo: 15000)";
  }
}

// Llama a esta función cuando se actualice el progreso del Bus Costa
counterSubject.addObserver(
  new Observer(
    () => {},
    () => {},
    () => {
      updateBusCostaButton();
    }
  )
);

document.getElementById("bus-costa").addEventListener("click", function () {
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

document.getElementById("siguiente-parada").addEventListener("click", function () {
  if (!this.classList.contains("purchased")) {
    purchaseButton("siguiente-parada", 1000);
  } else {
    counterSubject.startProgressBar((multiplier) => {
      counterSubject.counter = Math.round(
        counterSubject.counter + 100 * multiplier
      );
      counterSubject.notifyObservers();
    });
    this.textContent = "Viajando...";
    this.style.backgroundColor = "grey"; // Gris
  }
});

function updateButtonStyles() {
  const buttons = [
    { id: "cobrar-boleto", cost: 0 },
    { id: "contratar-chofer", cost: 100 },
    { id: "siguiente-parada", cost: 1000 },
    { id: "bus-costa", cost: 15000 },
  ];

  // Actualizar los botones principales
  buttons.forEach((button) => {
    const buttonElement = document.getElementById(button.id);
    const upgradeButton = document.querySelector(
      `.upgrade-button[data-target="${button.id}"]`
    );
    const upgradeCost = counterSubject.buttonUpgradeCosts[button.id];

    // Actualizar el texto del botón de upgrade
    if (upgradeButton) {
      upgradeButton.textContent = `↑ ${formatNumber(upgradeCost)}`;
    }

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
        if (upgradeButton) {
          upgradeButton.classList.add("blocked");
          upgradeButton.disabled = true;
        }
      }
    }
  });

  // Actualizar los botones "Mejorar Bus" y "Mejorar Chofer"
  const mejorarBusButton = document.getElementById("mejorar-bus");
  const mejorarChoferButton = document.getElementById("mejorar-chofer");
  const mejorarTerminalButton = document.getElementById("mejorar-terminal");
  const casino = document.getElementById("jugar");

  if (mejorarBusButton) {
    if (counterSubject.counter >= counterSubject.busUpgradeCost) {
      mejorarBusButton.classList.remove("blocked");
      mejorarBusButton.disabled = false;
    } else {
      mejorarBusButton.classList.add("blocked");
      mejorarBusButton.disabled = true;
    }
  }

  if (mejorarChoferButton) {
    if (counterSubject.counter >= counterSubject.choferUpgradeCost) {
      mejorarChoferButton.classList.remove("blocked");
      mejorarChoferButton.disabled = false;
    } else {
      mejorarChoferButton.classList.add("blocked");
      mejorarChoferButton.disabled = true;
    }
  }

  if (mejorarTerminalButton) {
    if (counterSubject.counter >= counterSubject.terminalUpgradeCost) {
      mejorarTerminalButton.classList.remove("blocked");
      mejorarTerminalButton.disabled = false;
    } else {
      mejorarTerminalButton.classList.add("blocked");
      mejorarTerminalButton.disabled = true;
    }
  }

  if (casino) {
    if (counterSubject.counter >= 1000) {
      casino.classList.remove("blocked");
      casino.disabled = false;
    } else {
      casino.classList.add("blocked");
      casino.disabled = true;
    }
  }
}

// Llamar a esta función al cargar el estado del juego
// updateButtonStyles();

counterSubject.addObserver(
  new Observer(
    () => {
      updateButtonStyles();
    },
    () => {},
    () => {}
  )
);

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
      const multiplier =
        counterSubject.busMultiplier * counterSubject.choferMultiplier;
      const intervalTime = 1000 / level;
      counterSubject.intervalId = setInterval(() => {
        const amount = Math.round(multiplier);
        createAnimatedNumber(amount);
        counterSubject.counter = Math.round(
          counterSubject.counter + multiplier
        );
        counterSubject.notifyObservers();
        saveGameState(counterSubject); // Guardar el estado durante el incremento automático
      }, intervalTime);

      // Actualizar el botón
      this.classList.remove("blocked");
      this.classList.add("purchased");
      this.disabled = false;
      this.textContent = "¡Chofer contratado!";
      this.style.backgroundColor = "#9e9e9e";
    } else {
      mostrarNotificacion(
        "¡No tenés suficientes pasajeros para contratar al chofer!"
      );
    }
  }
});

document.querySelectorAll(".upgrade-button").forEach((button) => {
  button.addEventListener("click", function () {
    const targetButtonId = this.getAttribute("data-target");
    const cost = parseInt(this.getAttribute("data-cost"), 10);
    upgradeButton(targetButtonId, cost);
  });
});

document.getElementById("mejorar-bus").addEventListener("click", upgradeBus);

document.getElementById("mejorar-chofer").addEventListener("click", upgradeChofer);

document.getElementById("mejorar-terminal").addEventListener("click", upgradeTerminal);

document.getElementById("jugar").addEventListener("click", function () {
  if (counterSubject.counter >= 1000) {
    // Costo mínimo para jugar
    counterSubject.counter -= 1000; // Costo fijo por jugar
    counterSubject.notifyObservers(); // Notificar a los observadores para actualizar la UI

    const randomOutcome = Math.random(); // Número aleatorio entre 0 y 1

    if (randomOutcome < 0.5) {
      // 50% de probabilidad de perder algo
      applyCasinoPenalty();
    } else {
      // 50% de probabilidad de ganar algo
      applyCasinoReward();
    }
  } else {
    mostrarNotificacion("¡Necesitás al menos 1.000 pasajeros para jugar!");
  }
});

function applyEffect(effectType, target, amount, message) {
  switch (effectType) {
    case "bonus":
      counterSubject.counter += amount;
      break;
    case "penalty":
      counterSubject.counter -= amount;
      break;
    case "levelUp":
      if (target === "bus" && counterSubject.busLevel < 10) {
        gainBondi();
      } else if (target === "chofer" && counterSubject.choferLevel < 5) {
        gainChofer();
      } else if (target === "terminal" && counterSubject.terminalLevel < 3) {
        gainTerminal();
      } else {
        mostrarNotificacion("¡No se puede subir más de nivel!");
        return; // Evita guardar estado si no se aplicó el efecto
      }
      break;
    case "levelDown":
      if (target === "bus" && counterSubject.busLevel > 1) {
        lostBondi();
      } else if (target === "chofer" && counterSubject.choferLevel > 1) {
        lostChofer();
      } else if (target === "terminal" && counterSubject.terminalLevel > 1) {
        lostTerminal();
      } else {
        mostrarNotificacion("¡No se puede bajar más de nivel!");
        return; // Evita guardar estado si no se aplicó el efecto
      }
      break;
    default:
      console.warn(`Tipo de efecto desconocido: ${effectType}`);
      return; // Evita ejecutar el resto si el efecto no es válido
  }

  mostrarNotificacion(message);
  saveGameState(counterSubject);
  counterSubject.notifyObservers();
}

function applyCasinoReward() {
  const rewards = [
    { type: "bonus", target: null, amount: 1000, message: "¡Ganaste 1000 pasajeros!" },
    { type: "levelUp", target: "bus", amount: null, message: "¡Ganaste un nivel del bondi!" },
    { type: "levelUp", target: "chofer", amount: null, message: "¡Ganaste un nivel del chofer!" },
  ];

  const selectedReward = rewards[Math.floor(Math.random() * rewards.length)];
  applyEffect(selectedReward.type, selectedReward.target, selectedReward.amount, selectedReward.message);
}

function applyCasinoPenalty() {
  const penalties = [
    { type: "penalty", target: null, amount: 1000, message: "¡Perdiste 1000 pasajeros!" },
    { type: "levelDown", target: "bus", amount: null, message: "¡Perdiste tu bondi!" },
    // { type: "levelDown", target: "chofer", amount: null, message: "¡Perdiste tu chofer!" },
    { type: "levelDown", target: "terminal", amount: null, message: "¡Perdiste tu Terminal!" },
    
  ];

  const selectedPenalty = penalties[Math.floor(Math.random() * penalties.length)];
  applyEffect(selectedPenalty.type, selectedPenalty.target, selectedPenalty.amount, selectedPenalty.message);
}

function handleRandomEvent(event) {
  mostrarNotificacion(event.message);

  if (event.bonus) {
    counterSubject.counter += event.bonus;
  } else if (event.penalty) {
    counterSubject.counter -= event.penalty;
  } else if (event.multiplier) {
    const originalMultiplier = counterSubject.choferMultiplier;
    counterSubject.choferMultiplier *= event.multiplier;
    setTimeout(() => {
      counterSubject.choferMultiplier = originalMultiplier;
      counterSubject.notifyObservers();
    }, event.duration);
  }

  saveGameState(counterSubject);
  counterSubject.notifyObservers();
}

// Tipos de eventos como plantillas reutilizables
const eventTemplates = {
  smallBonus: [
    "¡Vendedor ambulante se sube al bondi! (+100)",
    "¡Un billete entra volando por la ventanilla! (+100)",
    "¡Cobras de más sin querer (queriendo)! (+100)",
    "¡Atrapas a un punga! (+100)",
    "¡Es tu cumpleaños, los de siempre te hacen un regalo! (+100)",
    "¡Ayudás a un turista perdido por el conurbano y te da una propina! (+100)",
    "¡Encontraste monedas en los asientos! (+100)",
    "¡Un pasajero te invita un alfajor! (+100)",
  ],
  largeBonus: ["¡Encontrás una billetera llena de guita! (+5000)"],
  smallPenalty: [
    "¡Un canguro te roba por Plaza Constitución! (-50)",
    "¡El bondi se llevó puesto un pozo! (-50)",
    "¡Un pasajero se mareó y vomitó en el bondi! (-50)",
    "¡Casi atropellas a un anciano! (-50)",
    "¡Multa por exceso de velocidad! (-50)",
    "¡Un pasajero se subió sin pagar! (-50)",
    "¡Un pasajero te pidió direcciones y te hizo perder tiempo! (-50)",
    "¡Un pasajero se quejó de la música que ponés! (-50)",
    "¡El mate te hizo mal y debés ir al baño! (-50)",
    "¡Manifestaciones por Avenida Yrigoyen! (-50)",
    "¡Vas demasiado rápido! (-50)",
    "¡Le rompés un espejo a un auto! (-50)",
    "¡Pasás en rojo! (-50)",
  ],
  largePenalty: ["¡Chocás un auto de lujo! (-5000)"],
  doublePassengers: [
    "¡Hoy juega Racing! Doble de pasajeros por 30 segundos.",
    "¡La línea Roca está interrumpida! Doble de pasajeros por 30 segundos.",
    "¡Un influencer se sube al bondi y lo transmite en redes! Doble de pasajeros por 30 segundos.",
    "¡Paro de Subtes! Doble de pasajeros por 30 segundos.",
  ],
  halfPassengers: [
    "¡Un bondi trucho se te adelanta! Mitad de pasajeros por 30 segundos",
    "¡Fisura se pone a rapear por dinero! Mitad de pasajeros por 30 segundos",
    "¡Demasiado tráfico llegando a Catán! Mitad de pasajeros por 30 segundos",
  ],
  neutral: [
    "¡Un pasajero te dice que maneja mejor que vos! (No sucede nada)",
    "¡Se subió Adrián Dárgelos! (No sucede nada)",
    "¡Un pasajero se sube con un mate y no te ofrece! (No sucede nada)",
    "¡Un pasajero se te sienta al lado con el bondi vacío! (No sucede nada)",
    "¡Un anciano te cuenta su vida! (No sucede nada)",
  ],
};

// Función para seleccionar un mensaje aleatorio de una categoría
const getRandomMessage = (category) => {
  const messages = eventTemplates[category];
  return messages[Math.floor(Math.random() * messages.length)];
};

// Configuración de eventos con sus efectos
const eventConfigs = [
  { type: "bonus", amount: 100, getMessage: () => getRandomMessage("smallBonus"), duration: 0 },
  { type: "bonus", amount: 5000, getMessage: () => getRandomMessage("largeBonus"), duration: 0 },
  { type: "penalty", amount: 50, getMessage: () => getRandomMessage("smallPenalty"), duration: 0 },
  { type: "penalty", amount: 5000, getMessage: () => getRandomMessage("largePenalty"), duration: 0 },
  //{ type: "multiplier", amount: 2, getMessage: () => getRandomMessage("doublePassengers"), duration: 30000},
  //{ type: "multiplier", amount: 0.5, getMessage: () => getRandomMessage("halfPassengers"), duration: 30000 }, // Cambiado "half" a 0.5
  { type: "neutral", amount: 0, getMessage: () => getRandomMessage("neutral"), duration: 0 },
];

// Función para manejar eventos aleatorios directamente
function handleRandomEvent(event) {
  const { type, amount, duration, getMessage } = event;
  const message = getMessage();

  switch (type) {
    case "bonus":
      counterSubject.counter += amount;
      counterSubject.notifyObservers();
      mostrarNotificacion(message);
      break;
    case "penalty":
      counterSubject.counter = Math.max(0, counterSubject.counter - amount); // Evita negativos
      counterSubject.notifyObservers();
      mostrarNotificacion(message);
      break;
    case "multiplier":
      const originalbusMultiplier = counterSubject.busMultiplier;
      const originalChoferMultiplier = counterSubject.choferMultiplier;
      counterSubject.busMultiplier *= amount;
      counterSubject.choferMultiplier *= amount;
      mostrarNotificacion(message);
      counterSubject.notifyObservers();
      saveGameState(counterSubject);
      setTimeout(() => {
        counterSubject.busMultiplier = originalbusMultiplier;
        counterSubject.choferMultiplier = originalChoferMultiplier;
        counterSubject.notifyObservers();
        saveGameState(counterSubject); // Guardar el estado después de restaurar el multiplicador
      }, duration);
      break;
    case "neutral":
      mostrarNotificacion(message);
      break;
    default:
      console.warn(`Tipo de evento desconocido: ${type}`);
      return;
  }

  // Guardar estado y notificar observadores (excepto en multiplicadores, que se hace al finalizar)
  if (type !== "multiplier") {
    saveGameState(counterSubject);
    counterSubject.notifyObservers();
  }
}

// Función para iniciar un evento aleatorio
function startRandomEvent() {
  const randomEvent = eventConfigs[Math.floor(Math.random() * eventConfigs.length)];
  handleRandomEvent(randomEvent);
}

// Lanzar un evento aleatorio cada 30 segundos
setInterval(startRandomEvent, 30000);

function handleParada(paradaId, cost, nextParadaId, paisajeClass, porcentajeText) {
  if (counterSubject.counter >= cost && (!nextParadaId || counterSubject.purchasedStops.has(nextParadaId))) {
    counterSubject.counter -= cost;
    const paradaElement = document.getElementById(paradaId);
    paradaElement.classList.add("mapa-purchased");
    paradaElement.textContent = getStopName(paradaId);
    paisaje.classList.remove(paisajeClass);
    paisaje.classList.add(paisajeClass);
    porcentaje.textContent = porcentajeText;
    counterSubject.purchasedStops.add(paradaId);
    counterSubject.notifyObservers();
    saveGameState(counterSubject);
  }
}

const parada1 = document.querySelector("#parada1"),
      parada2 = document.querySelector("#parada2"),
      parada3 = document.querySelector("#parada3"),
      parada4 = document.querySelector("#parada4"),
      paisaje = document.querySelector("#paisaje"),
      porcentaje = document.querySelector("#porcentaje"),
      ascenderButton = document.querySelector("#ascender");

// Generic function to handle modals
function setupModal(modalId, openButtonId, closeButtonClass = ".close-modal") {
  const modal = document.getElementById(modalId);
  const openButton = document.getElementById(openButtonId);
  const closeButton = modal.querySelector(closeButtonClass);

  // Open the modal when the button is clicked
  openButton.addEventListener("click", () => {
    modal.style.display = "block";
  });

  // Close the modal when the close button (X) is clicked
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Close the modal when clicking outside of it
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  return modal; // Return the modal element for further customization if needed
}

// Specific setup for modals with dynamic content (e.g., info modals)
function setupInfoModal(modalId, buttonId, textGenerator) {
  const modal = setupModal(modalId, buttonId);
  const modalText = document.getElementById("modal-text");

  document.getElementById(buttonId).addEventListener("click", () => {
    modalText.textContent = textGenerator();
  });
}

parada1.addEventListener("click", () => {
  handleParada("parada1", 500000000, null, "parada1", "25%");
});

parada2.addEventListener("click", () => {
  handleParada("parada2", 1000000000, "parada1", "parada2", "50%");
});

parada3.addEventListener("click", () => {
  handleParada("parada3", 100000000000, "parada2", "parada3", "75%");
});

parada4.addEventListener("click", () => {
  handleParada("parada4", 1000000000000, "parada3", "parada4", "100%");
});

function getStopName(stopId) {
  const stopNames = {
    parada1: "Barrio Municipal",
    parada2: "Oficinas",
    parada3: "Centro Comercial",
    parada4: "Las Universidades",
  };
  return stopNames[stopId];
}

function getStopPercentage(stopId) {
  const stopPercentages = {
    parada1: "25%",
    parada2: "50%",
    parada3: "75%",
    parada4: "100%",
  };
  return stopPercentages[stopId];
}

function updateMapaButtonVisibility() {
  const mapaButton = document.getElementById("mapa");
  if (counterSubject.counter >= 500000000) {
    mapaButton.style.display = "block";
    ascenderButton.style.display = "block";
  } else {
    mapaButton.style.display = "none";
    ascenderButton.style.display = "none";
  }

  // Ensure purchasedStops is defined before accessing it
  if (counterSubject.purchasedStops) {
    parada2.style.display = counterSubject.purchasedStops.has("parada1")
      ? "block"
      : "none";
    parada3.style.display = counterSubject.purchasedStops.has("parada2")
      ? "block"
      : "none";
    parada4.style.display = counterSubject.purchasedStops.has("parada3")
      ? "block"
      : "none";
  }
  if (counterSubject.purchasedStops.has("parada4")) {
    mapaButton.textContent = "Mapa completo";
    mapaButton.classList.remove("titilar");
  }
}

counterSubject.addObserver(
  new Observer(
    () => {
      updateMapaButtonVisibility(); // Actualizar visibilidad de las paradas
    },
    () => {},
    () => {}
  )
);

function mostrarNotificacion(mensaje) {
  const notificacion = document.getElementById("notificacion");
  notificacion.textContent = mensaje;
  notificacion.classList.add("mostrar");

  setTimeout(() => {
    notificacion.classList.remove("mostrar");
  }, 6000);
}

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

function formatNumber(num) {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)} trillones`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)} billones`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)} millones`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)} mil`;
  return num;
}

const cheats = {
  'b': { value: 1000, message: '¡Cheat +1.000!' },
  'v': { value: 100000000, message: '¡Cheat +100.000.000!' },
  'n': { value: 0, message: '¡Pasajeros reseteados!', reset: true }
};

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const action = cheats[key];
  if (action) {
    counterSubject.counter = action.reset ? 0 : counterSubject.counter + action.value;
    counterSubject.notifyObservers();
    mostrarNotificacion(action.message);
  }
});

function resetGame() {
  localStorage.removeItem("gameState");
  isInitialState = true; // Marcar el estado como inicial
  location.reload(); // Recargar la página para reiniciar el juego
}

document.getElementById("reset-button").addEventListener("click", () => {
  if (confirm("¿Seguro querés eliminar todo el progreso?")) {
    resetGame();
  }
});