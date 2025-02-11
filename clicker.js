class Subject {
    constructor() {
      this.observers = []; // Lista de observadores
      this.counter = 0;    // Estado del contador
      this.intervalId = null; // Guardar el ID del intervalo
      this.progressIntervalId = null; // Guardar el ID del intervalo de "Ir a la Siguiente Parada"
      this.busCostaIntervalId = null; // Guardar el ID del intervalo de "Bus a la Costa"
      this.progress = 0; // Estado de la barra de "Ir a la Siguiente Parada"
      this.busCostaProgress = 0; // Estado de la barra de "Bus a la Costa"
      this.busCostaReady = false; // Indica si el "Bus a la Costa" está listo para reclamar la recompensa
      this.purchasedButtons = new Set(); // Almacena los botones comprados
      this.buttonLevels = { // Niveles de mejora de cada botón
        "cobrar-boleto": 1,
        "contratar-chofer": 1,
        "siguiente-parada": 1,
        "bus-costa": 1,
      };
      this.busLevel = 1; // Nivel del bus
      this.busMultiplier = 1; // Multiplicador de ganancia por mejora del bus
      this.busUpgradeCost = 5000; // Costo inicial para mejorar el bus
    }
  
    // Método para agregar observadores
    addObserver(observer) {
      this.observers.push(observer);
    }
  
    // Método para notificar a los observadores
    notifyObservers() {
      this.observers.forEach(observer => observer.update(this.counter));
    }
  
    // Método para incrementar el contador manualmente (Cobrar Boleto)
    increment() {
      const level = this.buttonLevels["cobrar-boleto"];
      const multiplier = (1 + (level - 1) * 0.002) * this.busMultiplier; // Ganancia mejorada
      this.counter = Math.round(this.counter + multiplier); // Redondear a entero
      this.notifyObservers(); // Notificar a los observadores
    }
  
    // Método para iniciar o detener el incremento automático (Contratar Chofer)
    toggleIncrementPerSecond() {
      if (this.intervalId) {
        clearInterval(this.intervalId); // Detener el intervalo
        this.intervalId = null;
      } else {
        const level = this.buttonLevels["contratar-chofer"];
        const multiplier = (1 + (level - 1) * 0.002) * this.busMultiplier; // Ganancia mejorada
        this.intervalId = setInterval(() => {
          this.counter = Math.round(this.counter + multiplier); // Redondear a entero
          this.notifyObservers();
        }, 1000);
      }
    }
  
    // Método para iniciar la barra de progreso (Ir a la Siguiente Parada)
    startProgressBar(callback) {
      if (this.progressIntervalId) return; // Si ya está en progreso, no hacer nada
  
      const level = this.buttonLevels["siguiente-parada"];
      const multiplier = (1 + (level - 1) * 0.002) * this.busMultiplier; // Ganancia mejorada
      this.progressIntervalId = setInterval(() => {
        this.progress += 1; // Incrementar el progreso en 1%
        if (this.progress >= 100) {
          clearInterval(this.progressIntervalId); // Detener el intervalo
          this.progressIntervalId = null;
          this.progress = 0; // Reiniciar el progreso
          this.counter = Math.round(this.counter + 100 * multiplier); // Redondear a entero
          callback(multiplier); // Ejecutar el callback cuando la barra llega al 100%
        }
        this.notifyProgress(); // Notificar el progreso
      }, 30); // Ajusta el tiempo para controlar la velocidad de la barra
    }
  
    // Método para iniciar la barra de progreso (Bus a la Costa)
    startBusCostaProgressBar() {
      if (this.busCostaIntervalId) return; // Si ya está en progreso, no hacer nada
  
      const level = this.buttonLevels["bus-costa"];
      const multiplier = (1 + (level - 1) * 0.002) * this.busMultiplier; // Ganancia mejorada
      this.busCostaIntervalId = setInterval(() => {
        this.busCostaProgress += 1; // Incrementar el progreso en 1%
        if (this.busCostaProgress >= 100) {
          clearInterval(this.busCostaIntervalId); // Detener el intervalo
          this.busCostaIntervalId = null;
          this.busCostaReady = true; // Marcar que la recompensa está lista
        }
        this.notifyBusCostaProgress(); // Notificar el progreso
      }, 100); // Más lento que la barra de "Ir a la Siguiente Parada"
    }
  
    // Método para reclamar la recompensa del "Bus a la Costa"
    claimBusCostaReward() {
      if (this.busCostaReady) {
        const level = this.buttonLevels["bus-costa"];
        const multiplier = (1 + (level - 1) * 0.002) * this.busMultiplier; // Ganancia mejorada
        this.counter = Math.round(this.counter + 1000 * multiplier); // Redondear a entero
        this.busCostaReady = false; // Reiniciar el estado
        this.busCostaProgress = 0; // Reiniciar el progreso
        this.notifyObservers(); // Notificar a los observadores
        this.notifyBusCostaProgress(); // Actualizar la barra de progreso
      }
    }
  
    // Método para comprar un botón
    purchaseButton(buttonId, cost) {
      if (this.counter >= cost && !this.purchasedButtons.has(buttonId)) {
        this.counter -= cost; // Restar el costo al contador
        this.purchasedButtons.add(buttonId); // Marcar el botón como comprado
        this.notifyObservers(); // Notificar a los observadores
        return true; // Compra exitosa
      }
      return false; // Compra fallida
    }
  
    // Método para mejorar un botón
    upgradeButton(buttonId, cost) {
      if (this.counter >= cost) {
        this.counter -= cost; // Restar el costo al contador
        this.buttonLevels[buttonId] += 1; // Aumentar el nivel del botón
        this.notifyObservers(); // Notificar a los observadores
        return true; // Mejora exitosa
      }
      return false; // Mejora fallida
    }
  
    // Método para mejorar el bus
    upgradeBus(cost) {
      if (this.counter >= cost) {
        this.counter -= cost; // Restar el costo al contador
        this.busLevel += 1; // Aumentar el nivel del bus
        this.busMultiplier *= 2; // Duplicar la ganancia de puntos
        this.busUpgradeCost *= 2; // Duplicar el costo para la próxima mejora
        this.notifyObservers(); // Notificar a los observadores
        return true; // Mejora exitosa
      }
      return false; // Mejora fallida
    }
  
    // Método para notificar el progreso de "Ir a la Siguiente Parada"
    notifyProgress() {
      this.observers.forEach(observer => observer.updateProgress(this.progress));
    }
  
    // Método para notificar el progreso del "Bus a la Costa"
    notifyBusCostaProgress() {
      this.observers.forEach(observer => observer.updateBusCostaProgress(this.busCostaProgress));
    }
  }
  
  // Clase Observer
  class Observer {
    constructor(updateFunction, updateProgressFunction, updateBusCostaProgressFunction) {
      this.updateFunction = updateFunction; // Guarda la función de callback para el contador
      this.updateProgressFunction = updateProgressFunction; // Guarda la función de callback para "Ir a la Siguiente Parada"
      this.updateBusCostaProgressFunction = updateBusCostaProgressFunction; // Guarda la función de callback para "Bus a la Costa"
    }
  
    // Método que se llama cuando el sujeto notifica un cambio
    update(newValue) {
      this.updateFunction(newValue); // Ejecuta la función de callback para el contador
    }
  
    // Método que se llama cuando el sujeto notifica un cambio en "Ir a la Siguiente Parada"
    updateProgress(newProgress) {
      this.updateProgressFunction(newProgress); // Ejecuta la función de callback para "Ir a la Siguiente Parada"
    }
  
    // Método que se llama cuando el sujeto notifica un cambio en "Bus a la Costa"
    updateBusCostaProgress(newProgress) {
      this.updateBusCostaProgressFunction(newProgress); // Ejecuta la función de callback para "Bus a la Costa"
    }
  }
  
  // Crear el sujeto (contador)
  const counterSubject = new Subject();
  
  // Crear un observador para actualizar el DOM
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
  
  // Agregar el observador al sujeto
  counterSubject.addObserver(displayObserver);
  
  // Función para mostrar notificaciones
  function mostrarNotificacion(mensaje) {
    const notificacion = document.getElementById("notificacion");
    notificacion.textContent = mensaje;
    notificacion.classList.add("mostrar");
  
    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      notificacion.classList.remove("mostrar");
    }, 3000);
  }
  
  // Función para comprar un botón
  function purchaseButton(buttonId, cost) {
    if (counterSubject.purchaseButton(buttonId, cost)) {
      const button = document.getElementById(buttonId);
      button.classList.add("purchased"); // Marcar el botón como comprado
      button.disabled = false; // Habilitar el botón
      button.textContent = button.textContent.replace(/\(Costo: \d+\)/, ""); // Eliminar el costo del texto
    } else {
      mostrarNotificacion("¡No tienes suficientes puntos para comprar este botón!");
    }
  }
  
  // Función para mejorar un botón
  function upgradeButton(buttonId, cost) {
    if (counterSubject.upgradeButton(buttonId, cost)) {
      const levelDisplay = document.getElementById(`${buttonId}-level`);
      const newLevel = counterSubject.buttonLevels[buttonId];
      levelDisplay.textContent = `Nivel ${newLevel}`; // Actualizar el nivel mostrado
    } else {
      mostrarNotificacion("¡No tienes suficientes puntos para mejorar este botón!");
    }
  }
  
  // Función para mejorar el bus
  function upgradeBus() {
    const cost = counterSubject.busUpgradeCost;
    if (counterSubject.upgradeBus(cost)) {
      const busImage = document.getElementById("bus-image");
      busImage.src = `/img/bus${counterSubject.busLevel}.jpg`; // Cambiar la imagen del bus
      const mejorarBusButton = document.getElementById("mejorar-bus");
      mejorarBusButton.textContent = `Mejorar Bus (Costo: ${counterSubject.busUpgradeCost})`;
      mostrarNotificacion("¡Bus mejorado! Ganancia de puntos duplicada.");
    } else {
      mostrarNotificacion("¡No tienes suficientes puntos para mejorar el bus!");
    }
  }
  
  // Manejar el evento de clic para "Cobrar Boleto"
  document.getElementById("cobrar-boleto").addEventListener("click", () => {
    counterSubject.increment(); // Incrementar el contador manualmente
  });
  
  // Manejar el evento de clic para "Contratar Chofer"
  document.getElementById("contratar-chofer").addEventListener("click", function() {
    if (!this.classList.contains("purchased")) {
      purchaseButton("contratar-chofer", 10); // Comprar el botón
    } else {
      if (!counterSubject.intervalId) { // Solo activar si no hay un intervalo activo
        counterSubject.toggleIncrementPerSecond();
        this.textContent = "Comprado!";
      }
    }
  });
  
  // Manejar el evento de clic para "Ir a la Siguiente Parada"
  document.getElementById("siguiente-parada").addEventListener("click", function() {
    if (!this.classList.contains("purchased")) {
      purchaseButton("siguiente-parada", 100); // Comprar el botón
    } else {
      counterSubject.startProgressBar((multiplier) => {
        counterSubject.counter = Math.round(counterSubject.counter + 100 * multiplier); // Redondear a entero
        counterSubject.notifyObservers(); // Notificar a los observadores
      });
    }
  });
  
  // Manejar el evento de clic para "Bus a la Costa"
  document.getElementById("bus-costa").addEventListener("click", function() {
    if (!this.classList.contains("purchased")) {
      purchaseButton("bus-costa", 1000); // Comprar el botón
    } else {
      if (counterSubject.busCostaReady) {
        counterSubject.claimBusCostaReward(); // Reclamar la recompensa si la barra está lista
        this.textContent = "Bus a la Costa"; // Restaurar el texto del botón
      } else {
        counterSubject.startBusCostaProgressBar();
        this.textContent = "Reclamar Puntos"; // Cambiar el texto del botón
      }
    }
  });
  
  // Manejar el evento de clic para mejorar un botón
  document.querySelectorAll(".upgrade-button").forEach(button => {
    button.addEventListener("click", function() {
      const targetButtonId = this.getAttribute("data-target");
      const cost = parseInt(this.getAttribute("data-cost"), 10);
      upgradeButton(targetButtonId, cost);
    });
  });
  
  // Manejar el evento de clic para "Mejorar Bus"
  document.getElementById("mejorar-bus").addEventListener("click", upgradeBus);
  
  // Función para formatear números grandes
  function formatNumber(num) {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)} trillones`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)} billones`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)} millones`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)} mil`;
    return num;
  }

  // Evento para sumar 100,000 puntos al presionar la tecla "b"
document.addEventListener("keydown", (event) => {
    if (event.key === "b" || event.key === "B") {
      counterSubject.counter += 100000; // Sumar 100,000 puntos
      counterSubject.notifyObservers(); // Notificar a los observadores
      mostrarNotificacion("¡100,000 puntos agregados!"); // Mostrar notificación
    }
  });