function lerParametros(){
    /*
    Entradas do simulador

    Conjunto de processos P[i] com atributos:
    Parâmetros globais:
    Atributo Descrição
    id Identificador único
    chegada instante de chegada
    execução tempo total de CPU
    prioridade inteiro (1 = maior prioridade)
    deadline instante máximo desejado (absoluto)
    quantum (absoluto) - para os algoritmos preemptivos
    sobrecarga_contexto (absoluto) - tempo gasto em cada troca de contexto
    
    arrayProcessos = [[nome do processo, duração do processo, chegada do processo = 0]]
     
    return arrayProcessos
    */
}

function sjf(arrayProcessos) {
    
    // Formato esperado para cada um dos processos: [PID, Chegada, Execução, Deadline, Prioridade]
    let processosRestantes = arrayProcessos.map(p => ({
        pid: p[0],
        chegada: p[1] ?? 0,
        execucao: p[2] ?? 0,
        deadline: p[3] ?? Infinity,
        prioridade: p[4] ?? 0
    }));
    
    let tabelaFinal = [];      // Armazena as linhas da tabela calculadas
    let ganttCoordenadas = []; // Armazena os blocos do gráfico: [PID, Inicio, Fim]
    let tempoAtual = 0;
    
    while (processosRestantes.length > 0) {
    
        let disponiveis = processosRestantes.filter(p => p.chegada <= tempoAtual);
        
        if (disponiveis.length === 0) {
            let proximaChegada = Math.min(...processosRestantes.map(p => p.chegada));
            // Calcula a ociosidade 
            ganttCoordenadas.push(["Ocioso", tempoAtual, proximaChegada]);
            tempoAtual = proximaChegada;
            continue;
        }
        
        ///// IMPLEMENTAÇÃO DO SJF

        // Inicialmente irá fazer o SJF clássico.
        // Mas se houver empate, irá usar FCFS para desempatar

        disponiveis.sort((a, b) => {
            if (a.execucao !== b.execucao) {
                return a.execucao - b.execucao;
            }
            return a.chegada - b.chegada;
        });
        
        let escolhido = disponiveis[0];
        
        // Calcula os dados da tabela
        
        let inicioExecucao = tempoAtual;
        let termino = inicioExecucao + escolhido.execucao;
        let turnaround = termino - escolhido.chegada;
        let tempoEspera = inicioExecucao - escolhido.chegada;
        let deadlineOk = (termino <= escolhido.deadline) ? "Sim" : "Não";
        
        // Guarda o objeto com a estrutura da tabela para cada processo, individualmente
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
        
        // Registra a execução no gráfico de Gantt
        ganttCoordenadas.push([escolhido.pid, inicioExecucao, termino]);
        
        // Avança o tempo do sistema
        tempoAtual = termino;
        
        // Remove o processo executado da lista de pendentes
        processosRestantes = processosRestantes.filter(p => p.pid !== escolhido.pid);
    }
    
    // Retorna os dois conjuntos de dados necessários para a interface
    return { tabelaFinal, ganttCoordenadas };
}

//[[id do processo, duração do processo, tempo de chegada]]
let processosTeste = [["a", 14, 8], ["b", 21], ["c", 6, 1], ["d", 32, 90]];


function diagramaGantt(){
    /*
    Saídas Obrigatórias
    1.​ Gráfico de Gantt:
    a.​ verde → execução
    b.​ vermelho → sobrecarga de contexto
    c.​ cinza → estouro de deadline
    d.​ linha vertical → deadline absoluto

    2.​ Tabela final:
    a.​ chegada, execucao, deadline, prioridade, inicio(s), termino, espera, turnaround,
    deadline_ok?.

    3.​ Resumo quantitativo:
    a.​ médias, throughput, % ociosidade, total de trocas de contexto.
    b.​ Modo passo-a-passo (opcional, p/ demonstração): atraso visual entre eventos.
    */
}