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
    this.choferMultiplier = 1; // Multiplicador inicial del chofer
    this.choferUpgradeCost = 10000; // Costo inicial para mejorar al chofer
    this.choferUpgradePercentage = 0.1; // Aumento del 10% por mejora
    this.choferLevel = 1; // Nivel actual del chofer
    this.choferMaxLevel = 5; // Nivel máximo del chofer

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
      const level = this.buttonLevels["contratar-chofer"]; // Usa el nivel del botón "contratar-chofer"
      const multiplier = this.busMultiplier * this.choferMultiplier; // Incluye el multiplicador del chofer
      const intervalTime = 1000 / level; // Reduce el intervalo según el nivel del botón "contratar-chofer"
      this.intervalId = setInterval(() => {
        const amount = Math.round(multiplier);
        createAnimatedNumber(amount);
        this.counter = Math.round(this.counter + multiplier);
        this.notifyObservers();
      }, intervalTime);
    }
  }

  restartIncrementPerSecond() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.toggleIncrementPerSecond(); // Reinicia el intervalo con el nuevo intervalTime
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
  
      // Reiniciar el intervalo si el botón "contratar-chofer" se mejora
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
  
      // Reiniciar el intervalo para aplicar el nuevo multiplicador
      if (this.intervalId) {
        this.restartIncrementPerSecond();
      }
  
      // Notificar a los observadores para actualizar la UI
      this.notifyObservers();
  
      return true;
    }
    return false;
  }

  upgradeChofer(cost) {
    if (this.counter >= cost && this.choferLevel < this.choferMaxLevel) {
      this.counter -= cost;
      this.choferMultiplier *= (1 + this.choferUpgradePercentage); // Aumenta el multiplicador en un 10%
      this.choferUpgradeCost *= 2; // Duplica el costo de la próxima mejora
      this.choferLevel += 1; // Aumenta el nivel del chofer
  
      // Reiniciar el intervalo para aplicar el nuevo multiplicador
      if (this.intervalId) {
        this.restartIncrementPerSecond();
      }
  
      // Notificar a los observadores para actualizar la UI
      this.notifyObservers();
  
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

document.getElementById("contratar-chofer").addEventListener("click", function () {
  if (!this.classList.contains("purchased")) {
    purchaseButton("contratar-chofer", 100);
  } else {
    if (!counterSubject.intervalId) {
      counterSubject.toggleIncrementPerSecond();
      this.textContent = "¡Chofer contratado!";
      this.style.backgroundColor = "#90caf9"; // Cambiar el color del botón
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

document.getElementById("mejorar-chofer").addEventListener("click", function () {
  const cost = counterSubject.choferUpgradeCost; // Costo dinámico de mejorar al chofer
  if (counterSubject.upgradeChofer(cost)) {
    // Actualizar la imagen del chofer
    const choferImage = document.getElementById("chofer-image");
    choferImage.src = `/img/chofer${counterSubject.choferLevel}.jpg`;

    // Actualizar el texto del botón "Mejorar Chofer"
    const mejorarChoferButton = document.getElementById("mejorar-chofer");
    if (counterSubject.choferLevel < counterSubject.choferMaxLevel) {
      mejorarChoferButton.textContent = `Mejorar Chofer (Costo: ${counterSubject.choferUpgradeCost})`;
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
  } else if (randomEvent.penalty && randomEvent.penalty !== "half") {
    // Aplicar penalización (como -50)
    counterSubject.counter -= randomEvent.penalty;
    counterSubject.notifyObservers();
  } else if (randomEvent.penalty === "half") {
    // Aplicar penalización de "mitad de ganancias"
    const originalMultiplier = counterSubject.busMultiplier;
    counterSubject.busMultiplier *= 0.5; // Reduce las ganancias a la mitad
    setTimeout(() => {
      counterSubject.busMultiplier = originalMultiplier; // Restaura el multiplicador original
      counterSubject.notifyObservers();
    }, randomEvent.duration);
  } else if (randomEvent.multiplier) {
    const originalMultiplier = counterSubject.busMultiplier;
    counterSubject.busMultiplier *= randomEvent.multiplier;
    setTimeout(() => {
      counterSubject.busMultiplier = originalMultiplier;
      counterSubject.notifyObservers();
    }, randomEvent.duration);
  }
}

// Lanzar un evento aleatorio cada 30 segundos
setInterval(startRandomEvent, 30000);
