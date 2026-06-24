export function sjf(arrayProcessos, sobrecargaContexto = 0) {
    
    // Formato esperado para cada um dos processos: [PID, Chegada, Execução, Deadline, Prioridade]
    let processosRestantes = arrayProcessos.map(p => ({
        pid: p[0],
        chegada: p[1] ?? 0,
        execucao: p[2] ?? 0,
        deadline: p[3] ?? Infinity,
        prioridade: p[4] ?? 0
    }));
    
    let tabelaFinal = [];      
    let ganttCoordenadas = []; 
    let tempoAtual = 0;
    
    while (processosRestantes.length > 0) {
    
        let disponiveis = processosRestantes.filter(p => p.chegada <= tempoAtual);
        
        if (disponiveis.length === 0) {
            let proximaChegada = Math.min(...processosRestantes.map(p => p.chegada));
            ganttCoordenadas.push(["Ocioso", tempoAtual, proximaChegada]);
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

        // ==========================================
        // --- INSERÇÃO DA SOBRECARGA DE CONTEXTO ---

        if (sobrecargaContexto > 0) {
            // Registra o bloco de sobrecarga no gráfico de Gantt (para pintar de vermelho depois)
            ganttCoordenadas.push(["Sobrecarga", tempoAtual, tempoAtual + sobrecargaContexto]);

            tempoAtual += sobrecargaContexto;
        }
        // ==========================================
        
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
            deadline: escolhido.deadline,
            prioridade: escolhido.prioridade,
            termino: termino,
            espera: tempoEspera,
            turnaround: turnaround,
            deadlineOk: deadlineOk
        });
        
        // Registra a execução real do processo no gráfico de Gantt (para pintar de verde)
        ganttCoordenadas.push([escolhido.pid, inicioExecucao, termino]);
        
        // Avança o tempo do sistema para o final da execução do processo
        tempoAtual = termino;
        
        processosRestantes = processosRestantes.filter(p => p.pid !== escolhido.pid);

    }
    // Como o SJF é não preemptivo, o número de preempções será automaticamente 0
    const numeroPreempcoes = 0
    
    return { tabelaFinal, 
        ganttCoordenadas, 
        numeroPreempcoes }
}
