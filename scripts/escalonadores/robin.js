export function robin(arrayProcessos, quantum = 2, sobrecargaContexto = 0) {

    let processosNaoChegados = arrayProcessos.map(p => ({
        pid: p[0],
        chegada: p[1] ?? 0,
        execucao: p[2] ?? 0,
        deadline: p[3] ?? Infinity,
        prioridade: p[4] ?? 0,
        tempoRestante: p[2] ?? 0 
    }));

    // Ordena pelo tempo de chegada para facilitar a entrada no sistema
    processosNaoChegados.sort((a, b) => a.chegada - b.chegada);

    let filaProntos = [];
    let processosConcluidos = [];
    let ganttCoordenadas = []; 
    
    let tempoAtual = 0;
    let numeroPreempcoes = 0;
    let totalProcessos = processosNaoChegados.length;

    // Função auxiliar para verificar quem chegou e jogar na fila de prontos
    const verificarChegadas = (tempo) => {
        while (processosNaoChegados.length > 0 && processosNaoChegados[0].chegada <= tempo) {
            filaProntos.push(processosNaoChegados.shift());
        }
    };

    while (processosConcluidos.length < totalProcessos) {
        
        verificarChegadas(tempoAtual);

        if (filaProntos.length === 0) {
            let proximoProcesso = processosNaoChegados[0];
            ganttCoordenadas.push(["Ocioso", tempoAtual, proximoProcesso.chegada]);
            tempoAtual = proximoProcesso.chegada;
            continue;
        }

        let escolhido = filaProntos.shift();

        // ==========================================
        // --- INSERÇÃO DA SOBRECARGA DE CONTEXTO ---
        if (sobrecargaContexto > 0) {
            ganttCoordenadas.push(["Sobrecarga", tempoAtual, tempoAtual + sobrecargaContexto]);
            tempoAtual += sobrecargaContexto;
            // Enquanto a sobrecarga acontece, novos processos podem chegar!
            verificarChegadas(tempoAtual);
        }
        // ==========================================

        // O processo vai executar pelo Quantum ou pelo tempo que falta, o que for menor
        let tempoExecutado = Math.min(escolhido.tempoRestante, quantum);
        let inicioExecucao = tempoAtual;
        let termino = inicioExecucao + tempoExecutado;

        // Registra o bloco no Gantt
        ganttCoordenadas.push([escolhido.pid, inicioExecucao, termino]);
        
        // Avança o tempo do sistema e desconta o que o processo já rodou
        tempoAtual = termino;
        escolhido.tempoRestante -= tempoExecutado;

        verificarChegadas(tempoAtual);

        if (escolhido.tempoRestante > 0) {
            numeroPreempcoes++;         
            filaProntos.push(escolhido); 
        } else {
            // Se o processo terminou, salva na lista de concluídos com seu término real
            processosConcluidos.push({
                ...escolhido,
                terminoFinal: tempoAtual
            });
        }
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