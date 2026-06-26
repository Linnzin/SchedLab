export function robin(arrayProcessos, quantum = 2, sobrecargaContexto = 0) {

  let processosNaoChegados = arrayProcessos.map(p => ({
    pid: p[0],
    chegada: p[1] ?? 0,
    execucao: p[2] ?? 0,
    deadline: p[3] ?? Infinity,
    prioridade: p[4] ?? 0,
    tempoRestante: p[2] ?? 0
  }));

  processosNaoChegados.sort((a, b) => a.chegada - b.chegada);

  let filaProntos = [];
  let processosConcluidos = [];
  let ganttCoordenadas = [];
  let tempoAtual = 0;
  let numeroPreempcoes = 0;
  let totalProcessos = processosNaoChegados.length;

  let ultimoPid = null;
  let ultimoPreemptado = false;   // indica se o último processo foi preemptado

  const verificarChegadas = (tempo) => {
    while (processosNaoChegados.length > 0 && processosNaoChegados[0].chegada <= tempo) {
      filaProntos.push(processosNaoChegados.shift());
    }
  };

  while (processosConcluidos.length < totalProcessos) {

    verificarChegadas(tempoAtual);

    // Se não há processos prontos, ocioso
    if (filaProntos.length === 0) {
      let proximoProcesso = processosNaoChegados[0];
      ganttCoordenadas.push(["Ocioso", tempoAtual, proximoProcesso.chegada]);
      tempoAtual = proximoProcesso.chegada;
      ultimoPid = null;
      ultimoPreemptado = false;
      continue;
    }

    let escolhido = filaProntos.shift();

    // ============================================================
    // SÓ APLICA SOBRECARGA SE O ÚLTIMO PROCESSO FOI PREEMPTADO
    // ============================================================
    if (ultimoPid !== null && ultimoPid !== escolhido.pid && ultimoPreemptado) {
      if (sobrecargaContexto > 0) {
        ganttCoordenadas.push(["Sobrecarga", tempoAtual, tempoAtual + sobrecargaContexto]);
        tempoAtual += sobrecargaContexto;
        verificarChegadas(tempoAtual);
      }
    }

    // Executa o processo
    let tempoExecutado = Math.min(escolhido.tempoRestante, quantum);
    let inicioExecucao = tempoAtual;
    let termino = inicioExecucao + tempoExecutado;

    ganttCoordenadas.push([escolhido.pid, inicioExecucao, termino]);

    tempoAtual = termino;
    escolhido.tempoRestante -= tempoExecutado;

    verificarChegadas(tempoAtual);

    // Atualiza estado do último processo
    if (escolhido.tempoRestante > 0) {
      numeroPreempcoes++;
      filaProntos.push(escolhido);
      ultimoPreemptado = true;   // foi preemptado
    } else {
      processosConcluidos.push({
        ...escolhido,
        terminoFinal: tempoAtual
      });
      ultimoPreemptado = false;  // terminou, não preemptado
    }

    ultimoPid = escolhido.pid;
  }

  let tabelaFinal = processosConcluidos.map(p => {
    let turnaround = p.terminoFinal - p.chegada;
    let espera = turnaround - p.execucao;
    return {
      pid: p.pid,
      chegada: p.chegada,
      execucao: p.execucao,
      deadline: p.deadline,
      prioridade: p.prioridade,
      termino: p.terminoFinal,
      espera: espera,
      turnaround: turnaround,
      deadlineOk: '-'
    };
  });

  return { tabelaFinal, ganttCoordenadas, numeroPreempcoes };
}