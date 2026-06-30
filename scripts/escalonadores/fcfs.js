// processArray -> [[pid, tempoDeChegada, duração, prioridade, deadline, quantum, sobrecarga]]
export function fcfs(processArray) {

  // ordena os processos por ordem de chegada
  const orderedProcessArray = processArray.sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0))

  // ====== ganttCoordenadas - blocos de execução ======
  let ganttCoordenadas = []; // [[ID, INICIO_BLOCO, FIM_BLOCO, FLAG_ESPERA, FLAG_SOBRECARGA, FLAG_DEADLINE]]
  
  for (let i = 0; i < orderedProcessArray.length; i++) {
    let processId = orderedProcessArray[i][0];
    let inicioProcesso = (i == 0) ? 0 : ganttCoordenadas[i - 1][2];
    inicioProcesso = (orderedProcessArray[i][1] > inicioProcesso) ? orderedProcessArray[i][1] : inicioProcesso;
    let fimProcesso = inicioProcesso + orderedProcessArray[i][2];

    ganttCoordenadas.push([processId, inicioProcesso, fimProcesso, false, false, false])
  }

  // ====== ganttCoordenadas - blocos de espera ======
  ganttCoordenadas.forEach(coord => {
    // encontra a coordenada em questão na lista das processos
    let process = processArray.find(proc => proc[0] === coord[0])
    if (coord[1] > process[1]) {
      ganttCoordenadas.push([coord[0], process[1], coord[1], true, false, false])
    }
  })

  // ====== tabelaFinal ======
  let tabelaFinal = []; //[{pid, chegada, execucao, deadline, prioridade, termino, espera, turnaround, deadlineOk}]
  for (let i = 0; i < processArray.length; i++) {
    // encontra o processo em questão na lista das coordenadas do diagrama de gantt
    let scheduledProcess = ganttCoordenadas.find(proc => proc[0] === processArray[i][0] && !proc[3] && !proc[4] && !proc[5]);
    tabelaFinal.push({
      pid: processArray[i][0],
      chegada: processArray[i][1],
      execucao: processArray[i][2],
      deadline: '-',
      prioridade: '-',
      termino: scheduledProcess[2],
      espera: (scheduledProcess[2] - processArray[i][1]) - processArray[i][2],
      turnaround: scheduledProcess[2] - processArray[i][1],
      deadlineOk: '-'
    })
  }

  // ====== numeroPreempcoes ======
  const numeroPreempcoes = 0; // fcfs não é preemptivo

  return { tabelaFinal, ganttCoordenadas, numeroPreempcoes }
}
