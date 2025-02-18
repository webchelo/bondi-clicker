const currentVersion = gameVersion; // Cambia esto cada vez que actualices tu sitio
const storedVersion = localStorage.getItem('appVersion');

if (storedVersion !== currentVersion) {
    localStorage.clear(); // Limpia el localStorage
    localStorage.setItem('appVersion', currentVersion); // Guarda la nueva versión
}

let isInitialState = true; // Bandera para controlar el estado inicial

// Variables para el título y versión
const gameTitle = "Bondi Clicker";
const gameVersion = "0.0.6";

// Variables para los textos de los botones
const cobrarBoletoText = "Cobrar Boleto";
const contratarChoferText = "Desbloquear (Costo: 100)";
const siguienteParadaText = "Desbloquear (Costo: 1.000)";
const busCostaText = "Desbloquear (Costo: 15.000)";

const parada1 = document.querySelector('#parada1')
const parada2 = document.querySelector('#parada2')
const parada3 = document.querySelector('#parada3')
const parada4 = document.querySelector('#parada4')
const paisaje = document.querySelector('#paisaje')
const porcentaje = document.querySelector('#porcentaje')
const ascenderButton = document.querySelector('#ascender')


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
    counterSubject.busUpgradeCost = 50000;
    counterSubject.choferMultiplier = 1;
    counterSubject.choferUpgradeCost = 10000;
    counterSubject.choferLevel = 1;
    counterSubject.terminalLevel = 1; // Nivel inicial de la terminal
    counterSubject.terminalMultiplier = 1; // Multiplicador inicial de la terminal
    counterSubject.terminalUpgradeCost = 50000000; // Costo inicial de mejora de la terminal
  
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

  updateBusCostaButton();
  updateParadaButton();
  updateButtonStyles();



  document.querySelector('#siguiente-parada-fill').style = 'background-color:#1976d2';
  document.querySelector('#bus-costa-fill').style = 'background-color:#1976d2';

  // Asignar el título y la versión
  const titleElement = document.querySelector("h1");
  titleElement.innerHTML = `${gameTitle} <span style="font-size: 1rem; font-family: Arial, Helvetica, sans-serif;">${gameVersion}</span>`;

  // Asignar los textos de los botones
  document.getElementById("cobrar-boleto").textContent = cobrarBoletoText;
  document.getElementById("contratar-chofer").textContent = contratarChoferText;
  document.getElementById("siguiente-parada").textContent = siguienteParadaText;
  document.getElementById("bus-costa").textContent = busCostaText;
  document.getElementById("mejorar-bus").textContent = document.querySelector('#mejorar-bus').textContent = `Mejorar bondi (Costo: ${formatNumber(counterSubject.busUpgradeCost)})`;
  document.getElementById("mejorar-chofer").textContent =  document.querySelector('#mejorar-chofer').textContent = `Mejorar chofer (Costo: ${formatNumber(counterSubject.choferUpgradeCost)})`;
  document.getElementById("mejorar-terminal").textContent =  document.querySelector('#mejorar-terminal').textContent = `Mejorar terminal (Costo: ${formatNumber(counterSubject.terminalUpgradeCost)})`;

  // Asignar las imágenes
  document.getElementById("bus-image").src = `img/bus${counterSubject.busLevel}.jpg`;
  document.getElementById("chofer-image").src = `/img/chofer${counterSubject.choferLevel}.jpg`;
  document.getElementById("terminal-image").src = `img/terminal${counterSubject.terminalLevel}.jpg`;
  document.getElementById("casino-image").src = `/img/casino.jpg`;

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
      contratarChoferButton.style.backgroundColor = "#9e9e9e";
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
      busUpgradeButton.textContent = 'Bondi a nivel máximo'
      busUpgradeButton.classList.add('gold')
      busUpgradeButton.classList.remove('purchasable')
    }

    // Actualizar upgrades de chofer
    if (counterSubject.choferLevel >= 5) {
      const choferUpgradeButton = document.querySelector('#mejorar-chofer')
      choferUpgradeButton.textContent = 'Chofer a nivel máximo'
      choferUpgradeButton.classList.add('gold')
      choferUpgradeButton.classList.remove('purchasable')
    }

    // Actualizar upgrades de la terminal
    if (counterSubject.terminalLevel >= 3) {
      const terminalUpgradeButton = document.querySelector('#mejorar-terminal')
      terminalUpgradeButton.textContent = 'Terminal a nivel máximo'
      terminalUpgradeButton.classList.add('gold')
      terminalUpgradeButton.classList.remove('purchasable')
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
      "contratar-chofer": document.getElementById("contratar-chofer").textContent,
      "siguiente-parada": document.getElementById("siguiente-parada").textContent,
      "bus-costa": document.getElementById("bus-costa").textContent,
      "mejorar-bus": document.getElementById("mejorar-bus").textContent,
      "mejorar-chofer": document.getElementById("mejorar-chofer").textContent,
    },
    buttonUpgradeCosts: subject.buttonUpgradeCosts,
    purchasedStops: Array.from(document.querySelectorAll('.mapa-purchased')).map(stop => stop.id) // Guardar las paradas compradas
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
    subject.terminalLevel = gameState.terminalLevel || 1; // Cargar el nivel de la terminal (valor por defecto 1 si no existe)
    subject.terminalMultiplier = gameState.terminalMultiplier || 1; // Cargar el multiplicador de la terminal (valor por defecto 1 si no existe)
    subject.terminalUpgradeCost = gameState.terminalUpgradeCost || 50000000; // Cargar el costo de mejora de la terminal (valor por defecto 50000000 si no existe)
    subject.buttonUpgradeCosts = gameState.buttonUpgradeCosts || { // Cargar los costos de mejora
      "cobrar-boleto": 50,
      "contratar-chofer": 50,
      "siguiente-parada": 50,
      "bus-costa": 50,
    };
    subject.purchasedStops = new Set(gameState.purchasedStops || []); 

    // Restaurar las paradas compradas en la UI
    gameState.purchasedStops.forEach(stopId => {
      const stopElement = document.getElementById(stopId);
      if (stopElement) {
        stopElement.classList.add('mapa-purchased');
        stopElement.textContent = getStopName(stopId); // Función para obtener el nombre de la parada
      }
    });

    // Actualizar el paisaje según la última parada comprada
    const lastStop = gameState.purchasedStops[gameState.purchasedStops.length - 1];
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
      Object.keys(gameState.buttonTexts).forEach(buttonId => {
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
    this.busUpgradeCost = 50000
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
        const siguienteParadaButton = document.getElementById("siguiente-parada");
        if (siguienteParadaButton) {
          siguienteParadaButton.textContent = "Conducir a la siguiente parada";
          siguienteParadaButton.style.backgroundColor = "#1976d2"; // Azul
        }
      }
      this.notifyProgress();
    }, (240 / ((this.busMultiplier * 2) + this.terminalMultiplier)));
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
    }, (1000 / ((this.busMultiplier * 3) + (this.terminalMultiplier * 3))));
  }

  claimBusCostaReward() {
    if (this.busCostaReady) {
      const level = this.buttonLevels["bus-costa"];
      const multiplier = getMultiplier(level) * (this.busMultiplier * 5) * (this.terminalMultiplier * 2);
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
      this.choferMultiplier *= (1 + this.choferUpgradePercentage);
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
    return true
  }

  lostBondi() {
    this.busMultiplier = 1;
    this.busUpgradeCost = 50000;
    //this.choferUpgradePercentage = 0.1;
    this.busLevel = 1;
    //this.choferMaxLevel = 5;
    saveGameState(this); // Guardar el estado después de mejorar al chofer
    this.notifyObservers();
    return true
  }

  lostTerminal() {
    this.terminalMultiplier = 1;
    this.terminalUpgradeCost = 50000000;
    //this.terminalUpgradePercentage = 0.1;
    this.terminalLevel = 1;
    //this.terminalMaxLevel = 3;
    saveGameState(this); // Guardar el estado después de mejorar al chofer
    this.notifyObservers();
    return true
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
    if(this.choferLevel < 5) {
      this.choferMultiplier *= (1 + this.choferUpgradePercentage);
      this.choferUpgradeCost *= 2; // Duplicar el costo para el próximo nivel
      this.choferLevel += 1;
      saveGameState(this); // Guardar el estado después de mejorar al chofer
      this.notifyObservers();
      return true;
    }
  }

  gainTerminal() {
    if (this.terminalLevel < 3) {
      this.terminalMultiplier *= (1 + this.choferUpgradePercentage);
      this.terminalUpgradeCost *= 2; // Duplicar el costo para el próximo nivel
      this.terminalLevel += 1;
      saveGameState(this); // Guardar el estado después de mejorar al chofer
      this.notifyObservers();
      return true;
    }

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
    mostrarNotificacion("¡No tenés suficientes pasajeros para comprar esta mejora!");
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
    mostrarNotificacion("¡No tenés suficientes pasajeros para comprar esta mejora!");
  }
}

function upgradeBus() {
  const cost = counterSubject.busUpgradeCost;
  if (counterSubject.upgradeBus(cost)) {
    const busImage = document.getElementById("bus-image");
    busImage.src = `img/bus${counterSubject.busLevel}.jpg`; // Actualizar la imagen del bus

    const mejorarBusButton = document.getElementById("mejorar-bus");
    
    if (counterSubject.busLevel < 10) {
      mejorarBusButton.textContent = `Mejorar bondi (Costo: ${formatNumber(counterSubject.busUpgradeCost)})`;
    } else {
      mejorarBusButton.textContent = "Bondi a nivel máximo";
      mejorarBusButton.classList.add('gold')
      mejorarBusButton.classList.remove('purchasable')
    
      //mejorarBusButton.disabled = true;
    }

    saveGameState(counterSubject);
    //counterSubject.notifyObservers(); // Notificar a los observadores para actualizar la UI
  } else if (counterSubject.busLevel >= 10) {
    mostrarNotificacion("¡El bondi ya está en su nivel máximo!");
  } else {
    mostrarNotificacion("¡No tenés suficientes pasajeros para mejorar el bondi!");
  }
}

function gainBondi() {
  if (counterSubject.gainBondi()) {
    const busImage = document.getElementById("bus-image");
    busImage.src = `img/bus${counterSubject.busLevel}.jpg`; // Actualizar la imagen del bus

    const mejorarBusButton = document.getElementById("mejorar-bus");
    
    if (counterSubject.busLevel < 10) {
      mejorarBusButton.textContent = `Mejorar bondi (Costo: ${formatNumber(counterSubject.busUpgradeCost)})`;
    } else {
      mejorarBusButton.textContent = "Bondi a nivel máximo";
      mejorarBusButton.classList.add('gold')
      mejorarBusButton.classList.remove('purchasable')
    
      //mejorarBusButton.disabled = true;
    }

    saveGameState(counterSubject);
    //counterSubject.notifyObservers(); // Notificar a los observadores para actualizar la UI
  } else if (counterSubject.busLevel >= 10) {
    mostrarNotificacion("¡El bondi ya está en su nivel máximo!");
  } else {
    mostrarNotificacion("¡No tenés suficientes pasajeros para mejorar el bondi!");
  }
}


function upgradeChofer() {
  const cost = counterSubject.choferUpgradeCost;
  if (counterSubject.upgradeChofer(cost)) {
    const choferImage = document.getElementById("chofer-image");
    choferImage.src = `img/chofer${counterSubject.choferLevel}.jpg`;

    const mejorarChoferButton = document.getElementById("mejorar-chofer");
    if (counterSubject.choferLevel < 5) {
      // Formatear el costo correctamente
      mejorarChoferButton.textContent = `Mejorar chofer (Costo: ${formatNumber(counterSubject.choferUpgradeCost)})`;
    } else {
      mejorarChoferButton.textContent = "Chofer a nivel máximo";
      mejorarChoferButton.classList.add('gold')
      mejorarChoferButton.classList.remove('purchasable')
      //mejorarChoferButton.disabled = true;
    }

    // Guardar el estado del botón en localStorage
    saveGameState(counterSubject);
    counterSubject.notifyObservers(); // Notificar a los observadores para actualizar la UI
  } else if (counterSubject.choferLevel >= counterSubject.choferMaxLevel) {
    mostrarNotificacion("¡El chofer ya está en su nivel máximo!");
  } else {
    mostrarNotificacion("¡No tenés suficientes pasajeros para mejorar al chofer!");
  }
}

function gainChofer() {
  if (counterSubject.gainChofer()) {
    const choferImage = document.getElementById("chofer-image");
    choferImage.src = `img/chofer${counterSubject.choferLevel}.jpg`;

    const mejorarChoferButton = document.getElementById("mejorar-chofer");
    if (counterSubject.choferLevel < 5) {
      // Formatear el costo correctamente
      mejorarChoferButton.textContent = `Mejorar chofer (Costo: ${formatNumber(counterSubject.choferUpgradeCost)})`;
    } else {
      mejorarChoferButton.textContent = "Chofer a nivel máximo";
      mejorarChoferButton.classList.add('gold')
      mejorarChoferButton.classList.remove('purchasable')
      //mejorarChoferButton.disabled = true;
    }

    // Guardar el estado del botón en localStorage
    saveGameState(counterSubject);
    counterSubject.notifyObservers(); // Notificar a los observadores para actualizar la UI
  } else if (counterSubject.choferLevel >= counterSubject.choferMaxLevel) {
    mostrarNotificacion("¡El chofer ya está en su nivel máximo!");
  } else {
    mostrarNotificacion("¡No tenés suficientes pasajeros para mejorar al chofer!");
  }
}

function upgradeTerminal() {
  const cost = counterSubject.terminalUpgradeCost;
  if (counterSubject.upgradeTerminal(cost)) {
    const terminalImage = document.getElementById("terminal-image");
    terminalImage.src = `img/terminal${counterSubject.terminalLevel}.jpg`;

    const mejorarTerminalButton = document.getElementById("mejorar-terminal");
    if (counterSubject.terminalLevel < 3) {
      // Formatear el costo correctamente
      mejorarTerminalButton.textContent = `Mejorar Terminal (Costo: ${formatNumber(counterSubject.terminalUpgradeCost)})`;
    } else {
      mejorarTerminalButton.textContent = "Terminal a nivel máximo";
      mejorarTerminalButton.classList.add('gold')
      mejorarTerminalButton.classList.remove('purchasable')
      //mejorarTerminalButton.disabled = true;
    }

    // Guardar el estado del botón en localStorage
    saveGameState(counterSubject);
    counterSubject.notifyObservers(); // Notificar a los observadores para actualizar la UI
  } else if (counterSubject.terminalLevel >= counterSubject.terminalMaxLevel) {
    mostrarNotificacion("¡La terminal ya está en su nivel máximo!");
  } else {
    mostrarNotificacion("¡No tenés suficientes pasajeros para mejorar la terminal!");
  }
}

function gainTerminal() {
  if (counterSubject.gainTerminal()) {
    const terminalImage = document.getElementById("terminal-image");
    terminalImage.src = `img/terminal${counterSubject.terminalLevel}.jpg`;

    const mejorarTerminalButton = document.getElementById("mejorar-terminal");
    if (counterSubject.terminalLevel < 3) {
      // Formatear el costo correctamente
      mejorarTerminalButton.textContent = `Mejorar Terminal (Costo: ${formatNumber(counterSubject.terminalUpgradeCost)})`;
    } else {
      mejorarTerminalButton.textContent = "Terminal a nivel máximo";
      mejorarTerminalButton.classList.add('gold')
      mejorarTerminalButton.classList.remove('purchasable')
      //mejorarTerminalButton.disabled = true;
    }

    // Guardar el estado del botón en localStorage
    saveGameState(counterSubject);
    counterSubject.notifyObservers(); // Notificar a los observadores para actualizar la UI
  } else if (counterSubject.terminalLevel >= counterSubject.terminalMaxLevel) {
    mostrarNotificacion("¡La terminal ya está en su nivel máximo!");
  } else {
    mostrarNotificacion("¡No tenés suficientes pasajeros para mejorar la terminal!");
  }
}

function lostChofer() {
  if (counterSubject.lostChofer()) {
    //counterSubject.lostChofer()
    const choferImage = document.getElementById("chofer-image");
    choferImage.src = `img/chofer${counterSubject.choferLevel}.jpg`;

    const mejorarChoferButton = document.getElementById("mejorar-chofer");
    if (counterSubject.choferLevel < 5) {
      // Formatear el costo correctamente
      mejorarChoferButton.textContent = `Mejorar chofer (Costo: ${formatNumber(counterSubject.choferUpgradeCost)})`;
      mejorarChoferButton.classList.remove('gold')
      mejorarChoferButton.classList.add('purchasable')
      //mejorarChoferButton.style.color = 'white'
      
    } else {
      mejorarChoferButton.textContent = "Chofer a nivel máximo";
      mejorarChoferButton.classList.add('gold')
      mejorarChoferButton.classList.remove('purchasable')
      //mejorarChoferButton.disabled = true;
    }

    // Guardar el estado del botón en localStorage
    saveGameState(counterSubject);
    counterSubject.notifyObservers(); // Notificar a los observadores para actualizar la UI
  } else if (counterSubject.choferLevel >= counterSubject.choferMaxLevel) {
    mostrarNotificacion("¡El chofer ya está en su nivel máximo!");
  } else {
    mostrarNotificacion("¡No tenés suficientes pasajeros para mejorar al chofer!");
  }
}

function lostBondi() {
  if (counterSubject.lostBondi()) {
    const busImage = document.getElementById("bus-image");
    busImage.src = `img/bus${counterSubject.busLevel}.jpg`; // Actualizar la imagen del bus

    const mejorarBusButton = document.getElementById("mejorar-bus");
    
    if (counterSubject.busLevel < 10) {
      mejorarBusButton.textContent = `Mejorar bondi (Costo: ${formatNumber(counterSubject.busUpgradeCost)})`;
      mejorarBusButton.classList.remove('gold')
      mejorarBusButton.classList.add('purchasable')
    } else {
      mejorarBusButton.textContent = "Bondi a nivel máximo";
      mejorarBusButton.classList.add('gold')
      mejorarBusButton.classList.remove('purchasable')
    
      //mejorarBusButton.disabled = true;
    }

    saveGameState(counterSubject);
    counterSubject.notifyObservers(); // Notificar a los observadores para actualizar la UI
    //counterSubject.notifyObservers(); // Notificar a los observadores para actualizar la UI
  } else if (counterSubject.busLevel >= 10) {
    mostrarNotificacion("¡El bondi ya está en su nivel máximo!");
  } else {
    mostrarNotificacion("¡No tenés suficientes pasajeros para mejorar el bondi!");
  }
}

function lostTerminal() {
  if (counterSubject.lostTerminal()) {
    const terminalImage = document.getElementById("terminal-image");
    terminalImage.src = `img/terminal${counterSubject.terminalLevel}.jpg`;

    const mejorarTerminalButton = document.getElementById("mejorar-terminal");
    if (counterSubject.terminalLevel < 3) {
      // Formatear el costo correctamente
      mejorarTerminalButton.textContent = `Mejorar Terminal (Costo: ${formatNumber(counterSubject.terminalUpgradeCost)})`;
      mejorarTerminalButton.classList.remove('gold')
      mejorarTerminalButton.classList.add('purchasable')
    } else {
      mejorarTerminalButton.textContent = "Terminal a nivel máximo";
      mejorarTerminalButton.classList.add('gold')
      mejorarTerminalButton.classList.remove('purchasable')
    }

    // Guardar el estado del botón en localStorage
    saveGameState(counterSubject);
    counterSubject.notifyObservers(); // Notificar a los observadores para actualizar la UI
  } else if (counterSubject.terminalLevel >= counterSubject.terminalMaxLevel) {
    mostrarNotificacion("¡La terminal ya está en su nivel máximo!");
  } else {
    mostrarNotificacion("¡No tenés suficientes pasajeros para mejorar la terminal!");
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

document.getElementById("siguiente-parada").addEventListener("click", function() {
  if (!this.classList.contains("purchased")) {
    purchaseButton("siguiente-parada", 1000);
  } else {
    counterSubject.startProgressBar((multiplier) => {
      counterSubject.counter = Math.round(counterSubject.counter + 100 * multiplier);
      counterSubject.notifyObservers();
    });
    this.textContent = "Viajando...";
    this.style.backgroundColor = "grey"; // Gris
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

counterSubject.addObserver(new Observer(
  () => {},
  () => {
    updateParadaButton(); // Actualizar el botón cuando el progreso cambie
  },
  () => {}
));


function updateButtonStyles() {
  const buttons = [
    { id: "cobrar-boleto", cost: 0 },
    { id: "contratar-chofer", cost: 100 },
    { id: "siguiente-parada", cost: 1000 },
    { id: "bus-costa", cost: 15000 },
  ];

  // Actualizar los botones principales
  buttons.forEach(button => {
    const buttonElement = document.getElementById(button.id);
    const upgradeButton = document.querySelector(`.upgrade-button[data-target="${button.id}"]`);
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
      this.style.backgroundColor = "#9e9e9e";
    } else {
      mostrarNotificacion("¡No tenés suficientes pasajeros para contratar al chofer!");
    }
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

document.getElementById("mejorar-chofer").addEventListener("click", upgradeChofer);

document.getElementById("mejorar-terminal").addEventListener("click", upgradeTerminal);

document.getElementById("jugar").addEventListener("click", function () {
  if (counterSubject.counter >= 1000) { // Costo mínimo para jugar
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

function applyCasinoPenalty() {
  const penalties = [
    {
      type: "pasajeros",
      amount: Math.round(counterSubject.counter * 0.1), // Pierde 10% de los pasajeros
      message: "¡Perdiste todos tus pasajeros!",
    },
    {
      type: "nivel",
      target: "bus",
      amount: 1,
      message: "¡Perdiste tu bondi!",
    },
    {
      type: "nivel",
      target: "chofer",
      amount: 1,
      message: "¡Perdiste a tu chofer!",
    },
    {
      type: "nivel",
      target: "terminal",
      amount: 1,
      message: "¡Perdiste tu terminal!",
    },
  ];

  const selectedPenalty = penalties[Math.floor(Math.random() * penalties.length)];

  if (selectedPenalty.type === "pasajeros") {
    //counterSubject.counter = Math.max(0, counterSubject.counter - selectedPenalty.amount);
    counterSubject.counter = 0;
    mostrarNotificacion(selectedPenalty.message);
  } else if (selectedPenalty.type === "nivel") {
    if (selectedPenalty.target === "bus" && counterSubject.busLevel > 1) {
      lostBondi()
      mostrarNotificacion(selectedPenalty.message);
    } else if (selectedPenalty.target === "chofer" && counterSubject.choferLevel > 1) {
      lostChofer()
      mostrarNotificacion(selectedPenalty.message);
    } else if (selectedPenalty.target === "terminal" && counterSubject.terminalLevel > 1) {
      lostTerminal()
      mostrarNotificacion(selectedPenalty.message);
    } else {
      counterSubject.counter = 0;
      mostrarNotificacion("¡Perdiste todos tus pasajeros!");
    }
  }

  saveGameState(counterSubject);
  updateButtonStyles(); // Actualizar los estilos de los botones
  counterSubject.notifyObservers(); // Notificar a los observadores para actualizar la UI
}

function applyCasinoReward() {
  const rewards = [
    {
      type: "pasajeros",
      amount: Math.round(counterSubject.counter * 10), // Gana 10% de los pasajeros
      message: `¡Ganaste muchísimos pasajeros`,
    },
    {
      type: "nivel",
      target: "bus",
      amount: 1,
      message: "¡Ganaste un nivel del bondi en el casino!",
    },
    {
      type: "nivel",
      target: "chofer",
      amount: 1,
      message: "¡Ganaste un nivel del chofer en el casino!",
    },
    {
      type: "nivel",
      target: "terminal",
      amount: 1,
      message: "¡Ganaste un nivel de la terminal en el casino!",
    },
  ];

  const selectedReward = rewards[Math.floor(Math.random() * rewards.length)];

  if (selectedReward.type === "pasajeros") {
    counterSubject.counter += selectedReward.amount;
    mostrarNotificacion(selectedReward.message);
  } else if (selectedReward.type === "nivel") {
    if (selectedReward.target === "bus" && counterSubject.busLevel < 10) {
      gainBondi()
      mostrarNotificacion(selectedReward.message);
    } else if (selectedReward.target === "chofer" && counterSubject.choferLevel < 5) {
      gainChofer()
      mostrarNotificacion(selectedReward.message);
    } else if (selectedReward.target === "terminal" && counterSubject.terminalLevel < 3) {
      gainTerminal()
      mostrarNotificacion(selectedReward.message);
    } else {
      mostrarNotificacion("¡Ya tenés el nivel máximo en el casino!");
    }
  }

  saveGameState(counterSubject);
  updateButtonStyles(); // Actualizar los estilos de los botones
  counterSubject.notifyObservers(); // Notificar a los observadores para actualizar la UI
}

function formatNumber(num) {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)} trillones`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)} billones`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)} millones`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)} mil`;
  return num;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "b" || event.key === "B") {
    counterSubject.counter += 1000;
    counterSubject.notifyObservers();
    mostrarNotificacion("¡1,000 puntos agregados!");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "v" || event.key === "V") {
    counterSubject.counter += 100000000;
    counterSubject.notifyObservers();
    mostrarNotificacion("¡100,000,000 puntos agregados!");
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
    const originalMultiplier = counterSubject.choferMultiplier;
    counterSubject.choferMultiplier *= 0.5; // Reduce las ganancias a la mitad
    setTimeout(() => {
      counterSubject.choferMultiplier = originalMultiplier; // Restaura el multiplicador original
      counterSubject.notifyObservers();
      saveGameState(counterSubject); // Guardar el estado después de restaurar el multiplicador
    }, randomEvent.duration);
  } else if (randomEvent.multiplier) {
    const originalMultiplier = counterSubject.choferMultiplier;
    counterSubject.choferMultiplier *= randomEvent.multiplier;
    setTimeout(() => {
      counterSubject.choferMultiplier = originalMultiplier;
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



  
  
  
    
  // Obtener el modal
const modal = document.getElementById("info-modal");

// Obtener el botón que abre el modal
const busInfoButton = document.getElementById("bus-info");
const choferInfoButton = document.getElementById("chofer-info");
const terminalInfoButton = document.getElementById("terminal-info");
const casinoInfoButton = document.getElementById("casino-info");

// Obtener el elemento <span> que cierra el modal
const closeModalButton = document.querySelector(".close-modal");

// Obtener el elemento donde se mostrará el texto dentro del modal
const modalText = document.getElementById("modal-text");

// Cuando el usuario haga clic en el botón, abrir el modal
busInfoButton.addEventListener("click", () => {
  modal.style.display = "block";
  updateModalText(`Lvl${counterSubject.busLevel} | Aumenta la velocidad de viaje considerablemente`);
});

// Cuando el usuario haga clic en el botón, abrir el modal
choferInfoButton.addEventListener("click", () => {
  modal.style.display = "block";
  updateModalText(`Lvl${counterSubject.choferLevel} | El chofer recoge cada vez más pasajeros`);
});

// Cuando el usuario haga clic en el botón, abrir el modal
terminalInfoButton.addEventListener("click", () => {
  modal.style.display = "block";
  updateModalText(`Lvl${counterSubject.terminalLevel} | Más bondis, más choferes`);
});

// Cuando el usuario haga clic en el botón, abrir el modal
casinoInfoButton.addEventListener("click", () => {
  modal.style.display = "block";
  updateModalText(`¡Probabilidad de victoria: 50%!`);
});

// Cuando el usuario haga clic en <span> (x), cerrar el modal
closeModalButton.addEventListener("click", () => {
  modal.style.display = "none";
});

// Cuando el usuario haga clic fuera del modal, cerrarlo
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Función para actualizar el texto del modal dinámicamente
function updateModalText(newText) {
  modalText.textContent = newText;
}




// Obtener el modal de 
const mapaModal = document.getElementById("mapa-modal");

// Obtener el botón que abre el modal de 
const mapaButton = document.getElementById("mapa");

// Obtener el elemento <span> que cierra el modal de 
const closeMapaModal = mapaModal.querySelector(".close-modal");

// Cuando el usuario haga clic en el botón, abrir el modal de 
mapaButton.addEventListener("click", () => {
  mapaModal.style.display = "block";
});

// Cuando el usuario haga clic en <span> (x), cerrar el modal de 
closeMapaModal.addEventListener("click", () => {
  mapaModal.style.display = "none";
});

// Cuando el usuario haga clic fuera del modal, cerrarlo
window.addEventListener("click", (event) => {
  if (event.target === mapaModal) {
    mapaModal.style.display = "none";
  }
});




parada1.addEventListener('click', () => {
  if (counterSubject.counter >= 500000000) {
    counterSubject.counter -= 500000000;
    parada1.classList.add('mapa-purchased');
    parada1.textContent = 'Barrio Municipal';
    paisaje.classList.add('parada1');
    porcentaje.textContent = '25%';
    counterSubject.purchasedStops.add('parada1'); // Agregar la parada al estado
    counterSubject.notifyObservers();
    saveGameState(counterSubject);
  }
});

parada2.addEventListener('click', () => {
  if (counterSubject.counter >= 1000000000 && counterSubject.purchasedStops.has('parada1')) {
    counterSubject.counter -= 1000000000;
    parada2.classList.add('mapa-purchased');
    parada2.textContent = 'Oficinas';
    paisaje.classList.remove('parada1');
    paisaje.classList.add('parada2');
    porcentaje.textContent = '50%';
    counterSubject.purchasedStops.add('parada2'); // Agregar la parada al estado
    counterSubject.notifyObservers();
    saveGameState(counterSubject);
  }
});

parada3.addEventListener('click', () => {
  if (counterSubject.counter >= 100000000000 && counterSubject.purchasedStops.has('parada2')) {
    counterSubject.counter -= 100000000000;
    parada3.classList.add('mapa-purchased');
    parada3.textContent = 'Centro Comercial';
    paisaje.classList.remove('parada2');
    paisaje.classList.add('parada3');
    porcentaje.textContent = '75%';
    counterSubject.purchasedStops.add('parada3'); // Agregar la parada al estado
    counterSubject.notifyObservers();
    saveGameState(counterSubject);
  }
});

parada4.addEventListener('click', () => {
  if (counterSubject.counter >= 1000000000000 && counterSubject.purchasedStops.has('parada3')) {
    counterSubject.counter -= 1000000000000;
    parada4.classList.add('mapa-purchased');
    parada4.textContent = 'Las Universidades';
    paisaje.classList.remove('parada3');
    paisaje.classList.add('parada4');
    porcentaje.textContent = '100%';
    mapaButton.classList.remove('titilar');
    mapaButton.classList.add('mapa-purchased');
    mapaButton.textContent = 'Mapa completo';
    counterSubject.purchasedStops.add('parada4'); // Agregar la parada al estado
    counterSubject.notifyObservers();
    saveGameState(counterSubject);
  }
});

function getStopName(stopId) {
  const stopNames = {
    'parada1': 'Barrio Municipal',
    'parada2': 'Oficinas',
    'parada3': 'Centro Comercial',
    'parada4': 'Las Universidades'
  };
  return stopNames[stopId];
}

function getStopPercentage(stopId) {
  const stopPercentages = {
    'parada1': '25%',
    'parada2': '50%',
    'parada3': '75%',
    'parada4': '100%'
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
    parada2.style.display = counterSubject.purchasedStops.has('parada1') ? 'block' : 'none';
    parada3.style.display = counterSubject.purchasedStops.has('parada2') ? 'block' : 'none';
    parada4.style.display = counterSubject.purchasedStops.has('parada3') ? 'block' : 'none';
  }
  if (counterSubject.purchasedStops.has('parada4')){
    mapaButton.textContent = 'Mapa completo';
    mapaButton.classList.remove('titilar')
  }
}

counterSubject.addObserver(new Observer(
  () => {
    updateMapaButtonVisibility(); // Actualizar visibilidad de las paradas
  },
  () => {},
  () => {}
));


// Obtener el modal de 
const ascenderModal = document.getElementById("ascender-modal");


// Cuando el usuario haga clic en el botón, abrir el modal de 
ascenderButton.addEventListener("click", () => {
  ascenderModal.style.display = "block";
});

const closeAscenderModal = ascenderModal.querySelector(".close-modal");

// Cuando el usuario haga clic en <span> (x), cerrar el modal de 
closeAscenderModal.addEventListener("click", () => {
  ascenderModal.style.display = "none";
});

// Cuando el usuario haga clic fuera del modal, cerrarlo
window.addEventListener("click", (event) => {
  if (event.target === ascenderModal) {
    ascenderModal.style.display = "none";
  }
});