export function sjf(arrayProcessos) {

  // Formato esperado para cada um dos processos: [PID, Chegada, Execução, Deadline, Prioridade]
  let processosRestantes = arrayProcessos.map(p => {
    let pid = p.id ?? p[0];
    let chegada = p.chegada ?? p[1];
    let execucao = p.execucao ?? p[2];
    let deadline = p.deadline ?? Infinity;
    let prioridade = p.prioridade ?? p[4];

    return {
      pid: pid,
      chegada: Number(chegada) || 0,
      execucao: Number(execucao) || 0,
      deadline: Number(deadline),
      prioridade: Number(prioridade) || 0
    };
  });

  let tabelaFinal = [];
  let ganttCoordenadas = [];
  let tempoAtual = 0;

  while (processosRestantes.length > 0) {

    let disponiveis = processosRestantes.filter(p => p.chegada <= tempoAtual);

    if (disponiveis.length === 0) {
      let proximaChegada = Math.min(...processosRestantes.map(p => p.chegada));
      // Registra o bloco ocioso na nova estrutura de 5 posições [pid, inicio, fim, trocaContexto, estouroDeadline]
      ganttCoordenadas.push(["Ocioso", tempoAtual, proximaChegada, false, false]);
      tempoAtual = proximaChegada;
      continue;
    }

    // Ordenação SJF e desempate feito com FCFS
    disponiveis.sort((a, b) => {
      if (a.execucao !== b.execucao) {
        return a.execucao - b.execucao;
      }
      return a.chegada - b.chegada;
    });

    let escolhido = disponiveis[0];

    // Calcula os dados da tabela (Agora com o tempoAtual)
    let inicioExecucao = tempoAtual;
    let termino = inicioExecucao + escolhido.execucao;
    let turnaround = termino - escolhido.chegada;
    let tempoEspera = inicioExecucao - escolhido.chegada;
    let deadlineOk = '-';

    tabelaFinal.push({
      pid: escolhido.pid,
      chegada: escolhido.chegada,
      execucao: escolhido.execucao,
      deadline: '-',
      prioridade: escolhido.prioridade,
      termino: termino,
      espera: tempoEspera,
      turnaround: turnaround,
      deadlineOk: deadlineOk
    });

    // Registra a execução real do processo no gráfico de Gantt (para pintar de verde)
    ganttCoordenadas.push([escolhido.pid, inicioExecucao, termino, false, false]);

    // Avança o tempo do sistema para o final da execução do processo
    tempoAtual = termino;

    processosRestantes = processosRestantes.filter(p => p.pid !== escolhido.pid);

  }
  // Como o SJF é não preemptivo, o número de preempções será automaticamente 0
  const numeroPreempcoes = 0

  return {
    tabelaFinal,
    ganttCoordenadas,
    numeroPreempcoes
  }
}
