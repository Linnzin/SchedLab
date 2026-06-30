'use strict';

const MAX_ITERATIONS = 8001;

// função: define a folga do processo
// FOLGA DO PROCESSO = DEADLINE - (TEMPO DE CHEGADA DO PROCESSO + DURAÇÃO DO PROCESSO)
function calcSlack(process) {
  return process[4] - (process[1] + process[2]);
}

// função: gera os blocos cinzas do diagrama de gantt
function delayedBlocks(ganttCoordenadas, arrayProcesses) {

  ganttCoordenadas.forEach((block) => {
    let process = arrayProcesses.find(proc => proc[0] === block[0]);
    if (block[1] < process[4] && process[4] < block[2] && !block[3] && !block[4] && !block[5]) {
      ganttCoordenadas.push([block[0], process[4], block[2], false, false, true]); // gantt: bloco de execução fora do prazo
      return
    }
    if (process[4] <= block[1] && !block[3] && !block[4] && !block[5]) {
      ganttCoordenadas.push([block[0], block[1], block[2], false, false, true]); // gantt: bloco de execução fora do prazo
      return
    }
  })
}

// // função: gera os blocos amarelos do diagrama de gantt
function waitingBlocks(ganttCoordenadas, arrayProcesses) {
  let pidSet = new Set(arrayProcesses.map(proc => proc[0]));

  [...pidSet].forEach(pid => {
    let process = arrayProcesses.find(proc => proc[0] === pid);
    let arrivalTime = process[1];

    // todos os blocos do processo que representam ocupação na CPU
    let activeBlocks = ganttCoordenadas
      .filter(block => block[0] === pid && !block[3] && !block[5])
      .sort((a, b) => a[1] - b[1]); // Ordena do começo ao fim

    if (activeBlocks.length === 0) return;

    // chegada até o primeiro uso da CPU
    let execTime = activeBlocks[0][1];
    if (arrivalTime < execTime) {
      ganttCoordenadas.push([pid, arrivalTime, execTime, true, false, false]); // gantt: espera inicial
    }

    // preenche os buracos entre as preempções
    for (let i = 0; i < activeBlocks.length - 1; i++) {
      let blockEnd = activeBlocks[i][2];
      let nextBlockStart = activeBlocks[i + 1][1];

      if (blockEnd < nextBlockStart) {
        ganttCoordenadas.push([pid, blockEnd, nextBlockStart, true, false, false]);
      }
    }
  });
}

// processArray -> [[pid 0, tempoDeChegada 1, duração 2, prioridade 3, deadline 4, quantum 5, sobrecarga 6]]
export function mlf(arrayProcesses) {
  // O processo com maior prioridade será aquele que tem mais folga para executar.
  // O processo que passar do prazo irá para a fila dos processos atrasados (delayedProcessesQueue).
  // A fila dos processos atrasado é ordenada pelo tempo de chegada.
  let localProcesses = arrayProcesses.map(proc => [...proc]);
  let orderedArrayProcesses = [...localProcesses].sort((a, b) => a[1] - b[1]); // ordenado por tempo de chegada

  const lastProcess = arrayProcesses[localProcesses.length - 1];
  let quantum = Math.max(1, Number(lastProcess?.[5]) || 1);
  let contextSwitch = Number(lastProcess?.[6]) || 0;

  let ganttCoordenadas = [] //[[ID, INICIO_BLOCO, FIM_BLOCO, FLAG_ESPERA, FLAG_SOBRECARGA, FLAG_DEADLINE]]
  let numeroPreempcoes = 0
  let tabelaFinal = [];
  arrayProcesses.forEach((proc) => {
    tabelaFinal.push({
      pid: proc[0],
      chegada: proc[1],
      execucao: proc[2],
      deadline: proc[4],
      prioridade: "-",
      termino: null,
      espera: null,
      turnaround: null,
      deadlineOk: null
    });
  });

  let processesAvailable = [];
  let delayedProcessesQueue = [];
  let finishedProcesses = [];
  let currentTime = 0;
  let iterations = 0;
  while (finishedProcesses.length < orderedArrayProcesses.length) {

    // proteção contra loop grandes demais
    iterations++;
    if (iterations > MAX_ITERATIONS) {
      console.error("REPETIÇÃO INTERROMPIDA - NÚMERO DE ITERAÇÕES SÃO MAIS DE 8 MIL!");
      break;
    }

    // filtra por novos processos no tempo atual
    let newProcesses = orderedArrayProcesses.filter(proc =>
      proc[1] <= currentTime &&
      !finishedProcesses.includes(proc) &&
      !processesAvailable.includes(proc) &&
      !delayedProcessesQueue.includes(proc)
    );

    // calcula o tempo de folga e adiciona na lista de processos disponíveis
    if (newProcesses.length > 0) {
      newProcesses.forEach(proc => {
        if (proc.length === 7) { proc.push(calcSlack(proc)) };
        if (currentTime + proc[2] > proc[4]) {
          delayedProcessesQueue.push(proc);
        } else {
          processesAvailable.push(proc);
        }
      });
    }

    // se no tempo atual não tiver processo disponível ou atrasado, vai para a chegada de um novo processo não finalizado 
    if (processesAvailable.length === 0 && delayedProcessesQueue.length === 0) {
      let nextProcess = orderedArrayProcesses.find(p => !finishedProcesses.includes(p));
      if (nextProcess) currentTime = nextProcess[1];
      continue;
    }

    // escolhe qual processo será executado
    let executingProcess = null;
    let isDelayedExecution = false;
    if (processesAvailable.length > 0) {
      // se existir processos disponíveis, ordena e pega o de maior folga
      processesAvailable.sort((a, b) => b[7] - a[7]);
      executingProcess = processesAvailable.shift();
      // garante que o processo está no prazo
      if (currentTime + executingProcess[2] > executingProcess[4]) {
        delayedProcessesQueue.push(executingProcess);
        continue;
      }
    } else if (delayedProcessesQueue.length > 0) {
      // se não existir processos disponíveis, pega o primeiro da fila de atrasados (FCFS)
      executingProcess = delayedProcessesQueue.shift();
      if (currentTime >= executingProcess[4]) {
        isDelayedExecution = true;
      }
    }

    // execução
    let blockStart = currentTime;
    if (executingProcess[2] > quantum && !isDelayedExecution) {
      // preempção
      let slice = blockStart + quantum;
      let blockEnd = slice + contextSwitch;

      ganttCoordenadas.push([executingProcess[0], blockStart, slice, false, false, false]); // gantt: bloco de execução
      ganttCoordenadas.push([executingProcess[0], slice, blockEnd, false, true, false]); // gantt: bloco de troca de contexto
      numeroPreempcoes++;

      currentTime = blockEnd;
      executingProcess[2] -= quantum; // diminui a duração do processo

      if (currentTime + executingProcess[2] > executingProcess[4]) {
        delayedProcessesQueue.push(executingProcess); // passou da deadline
      } else {
        processesAvailable.push(executingProcess); // volta pra fila
      }
    } else {
      // fim do processo ou processo atrasado
      let endProcess = blockStart + executingProcess[2];

      ganttCoordenadas.push([executingProcess[0], blockStart, endProcess, false, false, false]); // gantt: bloco de execução

      currentTime = endProcess;
      executingProcess[2] = 0;

      finishedProcesses.push(executingProcess);

      let tableProcess = tabelaFinal.find(proc => proc.pid === executingProcess[0]);
      if (tableProcess) {
        tableProcess.termino = endProcess;
        tableProcess.turnaround = tableProcess.termino - tableProcess.chegada;
        tableProcess.espera = tableProcess.turnaround - tableProcess.execucao;
        tableProcess.deadlineOk = (tableProcess.termino > tableProcess.deadline) ? "Não" : "Sim";
      }
    }
  }

  delayedBlocks(ganttCoordenadas, localProcesses);
  waitingBlocks(ganttCoordenadas, localProcesses)

  return { tabelaFinal, ganttCoordenadas, numeroPreempcoes };
}
