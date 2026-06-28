export function prioridade(processArray) {

  // Formato esperado para cada um dos processos: [PID, Chegada, Execução, Deadline, Prioridade]
  let processosRestantes = processArray.map(p => {
    let pid = p.id ?? p[0];
    let chegada = p.chegada ?? p[1];
    let execucao = p.execucao ?? p[2];
    let deadline = p.deadline ?? p[3]; 
    let prioridadeInfo = p.prioridade ?? p[4];

    return {
      pid: pid,
      chegada: Number(chegada) || 0,
      execucao: Number(execucao) || 0,
      deadline: (!deadline || deadline === '-') ? Infinity : Number(deadline),
      prioridade: Number(prioridadeInfo) || 0
    };
  });

 let tabelaFinal = [];
  let ganttCoordenadas = [];
  let tempoAtual = 0;

  while (processosRestantes.length > 0) {

    let disponiveis = processosRestantes.filter(p => p.chegada <= tempoAtual);

    if (disponiveis.length === 0) {
      let proximaChegada = Math.min(...processosRestantes.map(p => p.chegada));
      ganttCoordenadas.push(["Ocioso", tempoAtual, proximaChegada, false, false]);
      tempoAtual = proximaChegada;
      continue;
    }

    // Ordenação por Prioridade (Menor número = Maior prioridade) e desempate feito com FCFS
    disponiveis.sort((a, b) => {
      if (a.prioridade !== b.prioridade) {
        return a.prioridade - b.prioridade;
      }
      return a.chegada - b.chegada;
    });

    let escolhido = disponiveis[0];

    let inicioExecucao = tempoAtual;
    let termino = inicioExecucao + escolhido.execucao;
    let turnaround = termino - escolhido.chegada;
    let tempoEspera = inicioExecucao - escolhido.chegada;

    tabelaFinal.push({
      pid: escolhido.pid,
      chegada: escolhido.chegada,
      execucao: escolhido.execucao,
      deadline: '-', 
      prioridade: escolhido.prioridade,
      termino: termino,
      espera: tempoEspera,
      turnaround: turnaround,
      deadlineOk: '-' 
    });

    ganttCoordenadas.push([escolhido.pid, inicioExecucao, termino, false, false]);

    // Avança o tempo do sistema para o final da execução do processo
    tempoAtual = termino;

    processosRestantes = processosRestantes.filter(p => p.pid !== escolhido.pid);

  }
  
  // Como este algoritmo de Prioridade é não preemptivo, o número de preempções será automaticamente 0
  const numeroPreempcoes = 0;

  return {
    tabelaFinal,
    ganttCoordenadas,
    numeroPreempcoes
  };
}