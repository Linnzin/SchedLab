export function edf(arrayProcessos, quantum = 2, sobrecargaContexto = 0) {

  // Converte entradas (suporta array ou objeto)
  let processosNaoChegados = arrayProcessos.map(p => {
    let pid = p.id ?? p[0];
    let chegada = p.chegada ?? p[1];
    let execucao = p.execucao ?? p[2];
    let deadline = p.deadline ?? p[3];
    let prioridade = p.prioridade ?? p[4];

    let deadlineTratado = (deadline === "" || deadline === "-" || deadline === null || deadline === undefined)
      ? Infinity
      : Number(deadline);

    return {
      pid: pid,
      chegada: Number(chegada) || 0,
      execucao: Number(execucao) || 0,
      deadline: deadlineTratado,
      prioridade: Number(prioridade) || 0,
      tempoRestante: Number(execucao) || 0
    };
  });

  // Ordena por chegada para facilitar a inserção
  processosNaoChegados.sort((a, b) => a.chegada - b.chegada);

  let filaProntos = [];
  let processosConcluidos = [];
  let ganttCoordenadas = [];

  let tempoAtual = 0;
  let numeroPreempcoes = 0;
  let totalProcessos = processosNaoChegados.length;

  let ultimoPid = null;
  let ultimoPreemptado = false;   // indica se o último processo foi preemptado

  // Função para mover processos que já chegaram para a fila de prontos
  const verificarChegadas = (tempo) => {
    while (processosNaoChegados.length > 0 && processosNaoChegados[0].chegada <= tempo) {
      filaProntos.push(processosNaoChegados.shift());
    }
  };

  // Função para escolher o processo com menor deadline (EDF)
  const escolherPorDeadline = () => {
    if (filaProntos.length === 0) return null;
    // Ordena por deadline (menor primeiro), desempate por chegada
    filaProntos.sort((a, b) => {
      if (a.deadline !== b.deadline) return a.deadline - b.deadline;
      return a.chegada - b.chegada;
    });
    return filaProntos.shift();   // remove e retorna o primeiro
  };

  while (processosConcluidos.length < totalProcessos) {

    verificarChegadas(tempoAtual);

    // Se não há processos prontos, fica ocioso até a próxima chegada
    if (filaProntos.length === 0) {
      let proximoProcesso = processosNaoChegados[0];
      if (!proximoProcesso) break; // segurança
      ganttCoordenadas.push(["Ocioso", tempoAtual, proximoProcesso.chegada]);
      tempoAtual = proximoProcesso.chegada;
      ultimoPid = null;
      ultimoPreemptado = false;
      continue;
    }

    // Escolhe o processo com menor deadline
    let escolhido = escolherPorDeadline();

    // ============================================================
    // SÓ APLICA SOBRECARGA SE O ÚLTIMO PROCESSO FOI PREEMPTADO
    // ============================================================
    if (ultimoPid !== null && ultimoPreemptado) {
      if (sobrecargaContexto > 0) {
        ganttCoordenadas.push(["Sobrecarga", tempoAtual, tempoAtual + sobrecargaContexto]);
        tempoAtual += sobrecargaContexto;
        verificarChegadas(tempoAtual);
        // Após a sobrecarga, pode ser que novos processos tenham chegado,
        // mas o escolhido permanece (já foi retirado da fila). 
        // Se houver um processo com deadline menor que chegou durante a sobrecarga,
        // ele será considerado na próxima iteração, pois o escolhido já está fora da fila.
        // Isso é aceitável, pois a sobrecarga é um custo fixo.
      }
    }

    // Define o quanto o processo vai executar:
    // - No máximo o quantum
    // - No máximo o tempo restante
    let tempoExecutado = Math.min(escolhido.tempoRestante, quantum);

    // (Opcional) Podemos também limitar até a próxima chegada para preservar a preempção por deadline
    // Mas como vamos reavaliar a cada quantum, não é estritamente necessário.
    // Se quiser preempção imediata ao chegar um processo com deadline menor, 
    // podemos calcular o tempo até a próxima chegada e limitar.
    // Para manter o comportamento descrito, faremos a verificação apenas no final do quantum.

    let inicioExecucao = tempoAtual;
    let termino = inicioExecucao + tempoExecutado;

    // Registra o bloco no Gantt
    ganttCoordenadas.push([escolhido.pid, inicioExecucao, termino]);

    // Avança o tempo e desconta o que rodou
    tempoAtual = termino;
    escolhido.tempoRestante -= tempoExecutado;

    // Verifica se novos processos chegaram durante a execução
    verificarChegadas(tempoAtual);

    // Atualiza estado do processo
    if (escolhido.tempoRestante > 0) {
      // Processo não terminou → foi preemptado
      numeroPreempcoes++;
      // Coloca de volta na fila de prontos (será reordenado na próxima escolha)
      filaProntos.push(escolhido);
      ultimoPreemptado = true;
    } else {
      // Processo terminou
      escolhido.termino = tempoAtual;
      processosConcluidos.push(escolhido);
      ultimoPreemptado = false;
    }

    ultimoPid = escolhido.pid;
  }

  // Monta tabela final
  let tabelaFinal = processosConcluidos.map(p => {
    let turnaround = p.termino - p.chegada;
    let espera = turnaround - p.execucao;

    let cumpriuDeadline = "-";
    if (p.deadline !== Infinity) {
      cumpriuDeadline = p.termino <= p.deadline ? "Sim" : "Não";
    }

    return {
      pid: p.pid,
      chegada: p.chegada,
      execucao: p.execucao,
      deadline: p.deadline,
      prioridade: p.prioridade,
      termino: p.termino,
      espera: espera,
      turnaround: turnaround,
      deadlineOk: cumpriuDeadline
    };
  });

  return { tabelaFinal, ganttCoordenadas, numeroPreempcoes };
}