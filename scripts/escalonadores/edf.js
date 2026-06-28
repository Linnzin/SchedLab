export function edf(arrayProcessos) {
  // Define quantum e sobrecarga a partir do ultimo processo
  let ultimoProcesso = arrayProcessos[arrayProcessos.length - 1];

  let quantum = Math.max(1, Number(ultimoProcesso?.[5]) || 1);
  let sobrecarga = Number(ultimoProcesso?.[6]) || 0;

  // Converte entradas (suporta array ou objeto)
  let processosNaoChegados = arrayProcessos.map(p => {
    let pid = p.id ?? p[0];
    let chegada = p.chegada ?? p[1];
    let execucao = p.execucao ?? p[2];
    let prioridade = p.prioridade ?? p[3];
    let deadline = p.deadline ?? p[4];    

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
  let ultimoTempoPorProcesso = {} // ultimo instante em que cada processo saiu da CPU

  // Função para mover processos que já chegaram para a fila de prontos
  const verificarChegadas = (tempo) => {
    while (processosNaoChegados.length > 0 && processosNaoChegados[0].chegada <= tempo) {
      let p = processosNaoChegados.shift()
      filaProntos.push(p);
      ultimoTempoPorProcesso[p.pid] = p.chegada;
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
      ganttCoordenadas.push(["Ocioso", tempoAtual, proximoProcesso.chegada, false, false, false]);
      tempoAtual = proximoProcesso.chegada;
      ultimoPid = null;
      ultimoPreemptado = false;
      continue;
    }

    // Escolhe o processo com menor deadline
    let escolhido = escolherPorDeadline();
    let escolhido_pid = escolhido.pid;

    // ============================================================
    // SÓ APLICA SOBRECARGA SE O ÚLTIMO PROCESSO FOI PREEMPTADO
    // ============================================================
    if (ultimoPid !== null && ultimoPreemptado) {
      if (sobrecarga > 0) {
        ganttCoordenadas.push([ultimoPid, tempoAtual, tempoAtual + sobrecarga, false, true, false]);
        tempoAtual += sobrecarga;
        ultimoTempoPorProcesso[ultimoPid] += sobrecarga;
        verificarChegadas(tempoAtual);
        // Após a sobrecarga, pode ser que novos processos tenham chegado,
        // mas o escolhido permanece (já foi retirado da fila). 
        // Se houver um processo com deadline menor que chegou durante a sobrecarga,
        // ele será considerado na próxima iteração, pois o escolhido já está fora da fila.
        // Isso é aceitável, pois a sobrecarga é um custo fixo.
      }
    }

    // Bloco de espera
    // define tempo de espera a partir do tempo atual e do ultimo registro
    if (tempoAtual > ultimoTempoPorProcesso[escolhido_pid]){
      ganttCoordenadas.push([escolhido_pid, ultimoTempoPorProcesso[escolhido_pid],tempoAtual, 
        true, false, false])
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

    // Checa estouro de deadline e registra o bloco no gantt
    if (escolhido.deadline !== Infinity && termino > escolhido.deadline){
      ganttCoordenadas.push([escolhido.pid, inicioExecucao, termino, false, false, true]);
    }
    else {
      ganttCoordenadas.push([escolhido.pid, inicioExecucao, termino, false, false, false]);
    }

    // Avança o tempo e desconta o que rodou
    tempoAtual = termino;
    escolhido.tempoRestante -= tempoExecutado;

    // Verifica se novos processos chegaram durante a execução
    verificarChegadas(tempoAtual);

    // atualiza ultimo tempo do processo
    ultimoTempoPorProcesso[escolhido_pid] = termino

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
      deadline: p.deadline === Infinity ? '-' : p.deadline,
      prioridade: p.prioridade,
      termino: p.termino,
      espera: espera,
      turnaround: turnaround,
      deadlineOk: cumpriuDeadline
    };
  });

  return { tabelaFinal, ganttCoordenadas, numeroPreempcoes };
}