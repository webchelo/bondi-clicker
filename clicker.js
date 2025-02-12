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
    this.busUpgradeCost = 5000;
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
  }

  toggleIncrementPerSecond() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    } else {
      const level = this.buttonLevels["contratar-chofer"];
      const multiplier = getMultiplier(level) * this.busMultiplier;
      this.intervalId = setInterval(() => {
        const amount = Math.round(multiplier);
        createAnimatedNumber(amount);
        this.counter = Math.round(this.counter + multiplier);
        this.notifyObservers();
      }, 1000);
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
    }
  }

  purchaseButton(buttonId, cost) {
    if (this.counter >= cost && !this.purchasedButtons.has(buttonId)) {
      this.counter -= cost;
      this.purchasedButtons.add(buttonId);
      this.notifyObservers();
      return true;
    }
    return false;
  }

  upgradeButton(buttonId, cost) {
    if (this.counter >= cost) {
      this.counter -= cost;
      this.buttonLevels[buttonId] += 1;
      this.notifyObservers();
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
      this.notifyObservers();
      return true;
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
  }, 3000);
}

function purchaseButton(buttonId, cost) {
  if (counterSubject.purchaseButton(buttonId, cost)) {
    const button = document.getElementById(buttonId);
    button.classList.remove("blocked");
    button.classList.add("purchased");
    button.disabled = false;
    button.textContent = button.textContent.replace(/\(Costo: \d+\)/, "");

    // Cambiar el color de la barra de progreso correspondiente
    if (buttonId === "siguiente-parada") {
      const progressBar = document.getElementById("siguiente-parada-bar");
      progressBar.classList.remove("blocked");
      progressBar.classList.add("purchased");
    } else if (buttonId === "bus-costa") {
      const progressBar = document.getElementById("bus-costa-bar");
      progressBar.classList.remove("blocked");
      progressBar.classList.add("purchased");
    }
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
    busImage.src = `/img/bus${counterSubject.busLevel}.jpg`;

    const mejorarBusButton = document.getElementById("mejorar-bus");
    if (counterSubject.busLevel < 10) {
      mejorarBusButton.textContent = `Mejorar Bondi (Costo: ${counterSubject.busUpgradeCost})`;
    } else {
      mejorarBusButton.textContent = "Bondi a nivel máximo";
      mejorarBusButton.disabled = true;
    }

    mostrarNotificacion("¡Bondi mejorado! Ganancia de puntos duplicada.");
  } else if (counterSubject.busLevel >= 10) {
    mostrarNotificacion("¡El bondi ya está en su nivel máximo!");
  } else {
    mostrarNotificacion("¡No tienes suficientes puntos para mejorar el bondi!");
  }
}

function updateButtonStyles() {
  const buttons = [
    { id: "contratar-chofer", cost: 100 },
    { id: "siguiente-parada", cost: 1000 },
    { id: "bus-costa", cost: 15000 },
  ];

  buttons.forEach(button => {
    const buttonElement = document.getElementById(button.id);
    if (!counterSubject.purchasedButtons.has(button.id)) {
      if (counterSubject.counter >= button.cost) {
        buttonElement.classList.remove("blocked");
      } else {
        buttonElement.classList.add("blocked");
      }
    } else {
      buttonElement.classList.remove("blocked");
      buttonElement.classList.add("purchased");
    }
  });
}

counterSubject.addObserver(new Observer(
  () => {
    updateButtonStyles();
  },
  () => {},
  () => {}
));

// Función para crear números animados
function createAnimatedNumber(amount) {
  const container = document.getElementById("animated-numbers-container");
  const numberElement = document.createElement("div");
  numberElement.classList.add("animated-number");
  numberElement.textContent = `+${amount}`;
  container.appendChild(numberElement);

  // Eliminar el número animado después de que termine la animación
  setTimeout(() => {
    numberElement.remove();
  }, 1000);
}

// Función para calcular el multiplicador
function getMultiplier(level) {
  const BASE_MULTIPLIER = 1; // Aumenta en un 10% por nivel
  return 1 + (level - 1) * BASE_MULTIPLIER;
}

document.getElementById("cobrar-boleto").addEventListener("click", () => {
  counterSubject.increment();
});

document.getElementById("contratar-chofer").addEventListener("click", function() {
  if (!this.classList.contains("purchased")) {
    purchaseButton("contratar-chofer", 100);
  } else {
    if (!counterSubject.intervalId) {
      counterSubject.toggleIncrementPerSecond();
      this.textContent = "Chofer contratado!";
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

document.getElementById("bus-costa").addEventListener("click", function() {
  if (!this.classList.contains("purchased")) {
    purchaseButton("bus-costa", 15000);
  } else {
    if (counterSubject.busCostaReady) {
      counterSubject.claimBusCostaReward();
      this.textContent = "Bus a la Costa";
    } else {
      counterSubject.startBusCostaProgressBar();
      this.textContent = "Terminar viaje";
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