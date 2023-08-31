const minhaFuncaoPrincipal = require('./puppeteer.js');

//Captura 
function getRandomTime(startHour, endHour) {
    const date = new Date();
    const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
  
    date.setHours(hour, minute, second);
  
    return date;
}

function runTask(startHour, endHour) {
    minhaFuncaoPrincipal().then(() => {
      // Quando a função principal é bem-sucedida, mostre a próxima execução
      const nextRun = getRandomTime(startHour, endHour);
      console.log(`A próxima execução entre ${startHour}h e ${endHour}h será às ${nextRun}`);
    }).catch(err => {
      // Quando há um erro
      console.error("Erro durante a execução:", err);
    });
  }

function scheduleRandomTask(startHour, endHour) {
    const nextRun = getRandomTime(startHour, endHour);
    const now = new Date();
  
    // Se o tempo de execução já passou, programe para o dia seguinte
    if (nextRun < now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
  
    const delay = nextRun - now;

    // Mostrar a hora da próxima execução no console
    console.log(`Próxima execução entre ${startHour}h e ${endHour}h será às ${nextRun}`);
  
    setTimeout(() => {
      runTask();
      scheduleRandomTask(startHour, endHour); // Reagendar a próxima execução
    }, delay);
  }
  
  // Inicializa a programação
  scheduleRandomTask(8, 10);  // Primeira execução entre 08h e 10h
  scheduleRandomTask(10, 13);  // Primeira execução entre 10h e 13h
  scheduleRandomTask(13, 15); // Segunda execução entre 13h e 15h
  scheduleRandomTask(15, 18); // Terceira execução entre 15h e 18h
  scheduleRandomTask(18, 20); // Terceira execução entre 18h e 20h
  scheduleRandomTask(20, 22); // Terceira execução entre 18h e 20h
