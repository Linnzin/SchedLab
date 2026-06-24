export function edf(arrayProcessos, sobrecargaContexto = 0) {
    
    let processos = arrayProcessos.map(p => {
        // Identifica se o dado veio como objeto ou array
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

    let concluidos = [];
    let ganttBruto = []; 
    let tempoAtual = 0;
    let numeroPreempcoes = 0;
    let ultimoPid = null;
    let totalProcessos = processos.length;

    while (concluidos.length < totalProcessos) {
        
        let disponiveis = processos.filter(p => p.chegada <= tempoAtual && p.tempoRestante > 0);

        if (disponiveis.length === 0) {
            let proximos = processos.filter(p => p.tempoRestante > 0).sort((a,b) => a.chegada - b.chegada);
            let proximaChegada = proximos[0].chegada;
            
            ganttBruto.push({ pid: "Ocioso", inicio: tempoAtual, fim: proximaChegada });
            tempoAtual = proximaChegada;
            ultimoPid = "Ocioso";
            continue; 
        }

        // ==========================================
        // --------- ORDENAÇÃO POR DEADLINE ---------
        disponiveis.sort((a, b) => {
            if (a.deadline !== b.deadline) {

                // O menor deadline ganha a CPU

                return a.deadline - b.deadline; 
            }
            // Desempate com FCFS
            return a.chegada - b.chegada; 
        });

        let escolhido = disponiveis[0];
        // ==========================================

        // --- VERIFICAÇÃO DE PREEMPÇÃO E SOBRECARGA ---

        if (ultimoPid !== null && ultimoPid !== "Ocioso" && ultimoPid !== "Sobrecarga" && ultimoPid !== escolhido.pid) {
            let pAnterior = processos.find(p => p.pid === ultimoPid);
            
            if (pAnterior && pAnterior.tempoRestante > 0) {
                numeroPreempcoes++;
                
                if (sobrecargaContexto > 0) {
                    ganttBruto.push({ pid: "Sobrecarga", inicio: tempoAtual, fim: tempoAtual + sobrecargaContexto });
                    tempoAtual += sobrecargaContexto;
                    ultimoPid = "Sobrecarga";
                    continue; 
                }
            }
        }

        // O processo vai rodar até terminar OU até a chegada do próximo processo no sistema
        let proximos = processos.filter(p => p.chegada > tempoAtual && p.tempoRestante > 0).sort((a,b) => a.chegada - b.chegada);
        let tempoExecucao = escolhido.tempoRestante; // A princípio, tenta rodar tudo que falta

        if (proximos.length > 0) {
            let proximaChegada = proximos[0].chegada;
            // Se o tempo que ele precisa for invadir o tempo de uma nova chegada, ele roda só até a nova chegada
            if (tempoAtual + tempoExecucao > proximaChegada) {
                tempoExecucao = proximaChegada - tempoAtual;
            }
        }

        // Registra a fatia de tempo e avança o relógio
        ganttBruto.push({ pid: escolhido.pid, inicio: tempoAtual, fim: tempoAtual + tempoExecucao });
        tempoAtual += tempoExecucao;
        escolhido.tempoRestante -= tempoExecucao;
        ultimoPid = escolhido.pid;

        // Verifica se terminou de verdade
        if (escolhido.tempoRestante === 0) {
            escolhido.termino = tempoAtual;
            concluidos.push(escolhido);
        }
    }

    let ganttCoordenadas = [];
    if (ganttBruto.length > 0) {
        let blocoAtual = ganttBruto[0];
        for (let i = 1; i < ganttBruto.length; i++) {
            if (ganttBruto[i].pid === blocoAtual.pid) {
                blocoAtual.fim = ganttBruto[i].fim;
            } else {
                ganttCoordenadas.push([blocoAtual.pid, blocoAtual.inicio, blocoAtual.fim]);
                blocoAtual = ganttBruto[i];
            }
        }
        ganttCoordenadas.push([blocoAtual.pid, blocoAtual.inicio, blocoAtual.fim]);
    }

    let tabelaFinal = concluidos.map(p => {
        let turnaround = p.termino - p.chegada;
        let espera = turnaround - p.execucao; 
        
        let cumpriuDeadline = "-";
        if (p.deadline !== Infinity) {
            cumpriuDeadline = Number(p.termino) <= Number(p.deadline) ? "Sim" : "Não";
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