// processArray -> [[pid, tempoDeChegada, duração, prioridade, deadline, quantum, sobrecarga]]
export function robin(arrayProcessos) {
  // Define quantum e sobrecarga a partir do ultimo processo
  let ultimoProcesso = arrayProcessos[arrayProcessos.length - 1];

  let quantum = Math.max(1, Number(ultimoProcesso?.[5]) || 1);
  let sobrecarga = Number(ultimoProcesso?.[6]) || 0;

  // Converte entradas 
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

  processosNaoChegados.sort((a, b) => a.chegada - b.chegada);

  let filaProntos = [];
  let processosConcluidos = [];
  let ganttCoordenadas = [];

  let tempoAtual = 0;
  let numeroPreempcoes = 0;
  let totalProcessos = processosNaoChegados.length;

  let ultimoPid = null;
  let ultimoPreemptado = false;
  let ultimoTempoPorProcesso = {};
  let processoPreemptado = null; 

  const verificarChegadas = (tempo) => {
    while (processosNaoChegados.length > 0 && processosNaoChegados[0].chegada <= tempo) {
      let p = processosNaoChegados.shift();
      filaProntos.push(p);
      ultimoTempoPorProcesso[p.pid] = p.chegada;
    }
  };

  while (processosConcluidos.length < totalProcessos) {
    verificarChegadas(tempoAtual);
    // Se não há processos prontos, fica ocioso até a próxima chegada
    if (filaProntos.length === 0) {
      // Se há processo preemptado aguardando sobrecarga, não vai para ocioso
      if (processoPreemptado) {
        // força a próxima iteração processar a sobrecarga/reinserção
        // inserindo diretamente na fila
        filaProntos.push(processoPreemptado);
        processoPreemptado = null;
        continue;
      }
      let proximoProcesso = processosNaoChegados[0];
      if (!proximoProcesso) break;
      ganttCoordenadas.push(["Ocioso", tempoAtual, proximoProcesso.chegada, false, false, false]);
      tempoAtual = proximoProcesso.chegada;
      ultimoPid = null;
      ultimoPreemptado = false;
      continue;
    }

    let escolhido = filaProntos.shift();
    let escolhido_pid = escolhido.pid;

    // ============================================================
    // BLOCO DE SOBRECARGA (se houve preempção)
    // ============================================================
    if (ultimoPid !== null && ultimoPreemptado) {
      if (sobrecarga > 0) {
        ganttCoordenadas.push([ultimoPid, tempoAtual, tempoAtual + sobrecarga, false, true, false]);
        tempoAtual += sobrecarga;
        ultimoTempoPorProcesso[ultimoPid] = tempoAtual;
        verificarChegadas(tempoAtual);
      }
      // Sempre reinsere, independente de haver sobrecarga
      if (processoPreemptado) {
        filaProntos.push(processoPreemptado);
        processoPreemptado = null;
      }
    }

    // ============================================================
    // BLOCO DE ESPERA (do escolhido)
    // define tempo de espera a partir do tempo atual e do ultimo registro
    // ============================================================
    if (tempoAtual > (ultimoTempoPorProcesso[escolhido_pid] ?? escolhido.chegada)) {
      let inicioEspera = ultimoTempoPorProcesso[escolhido_pid] ?? escolhido.chegada;
      ganttCoordenadas.push([escolhido_pid, inicioEspera, tempoAtual, true, false, false]);
    }

    // ============================================================
    // EXECUÇÃO
    // ============================================================
    let tempoExecutado = Math.min(escolhido.tempoRestante, quantum);
    let inicioExecucao = tempoAtual;
    let termino = inicioExecucao + tempoExecutado;

    // Flag de deadline estourada
    let flagDeadline = false;
    if (escolhido.deadline !== Infinity && termino > escolhido.deadline) {
      flagDeadline = true;
    }

    ganttCoordenadas.push([escolhido.pid, inicioExecucao, termino, false, false, flagDeadline]);

    tempoAtual = termino;
    escolhido.tempoRestante -= tempoExecutado;

    verificarChegadas(tempoAtual);

    if (escolhido.tempoRestante > 0) {
      numeroPreempcoes++;
      ultimoPreemptado = true;
      processoPreemptado = escolhido;
      // NÃO insere na fila ainda — será inserido após a sobrecarga
    } else {
      escolhido.termino = tempoAtual;
      processosConcluidos.push(escolhido);
      ultimoPreemptado = false;
      ultimoTempoPorProcesso[escolhido_pid] = termino;
      processoPreemptado = null;
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
  console.table(ganttCoordenadas)
  return { tabelaFinal, ganttCoordenadas, numeroPreempcoes };
}