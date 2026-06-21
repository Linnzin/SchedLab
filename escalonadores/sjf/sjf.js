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

function sjf(arrayProcessos){

   let processosRestantes = arrayProcessos.map(p => [p[0], p[1], p[2] ?? 0]);
   let ganttCoordenadas = [];
   let tempoAtual = 0;

   while (processosRestantes.length > 0) {
        // Filtrar os processos que já chegaram até o tempo atual
        let processosDisponiveis = processosRestantes.filter(p => p[2] <= tempoAtual);
        
        // Se nenhum processo chegou ainda, o CPU fica ocioso (Gargalo de ociosidade)
        if (processosDisponiveis.length === 0) {
            // Avançamos o tempo atual diretamente para o tempo de chegada do próximo processo mais próximo
            let proximaChegada = Math.min(...processosRestantes.map(p => p[2]));
            tempoAtual = proximaChegada;
            continue; // Reinicia o loop com o tempo atualizado
        }
        
        // Escolher o processo com o MENOR tempo de execução (SJF)
        // Em caso de empate na execução, critério de desempate: quem chegou primeiro (FCFS)
        processosDisponiveis.sort((a, b) => {
            if (a[1] !== b[1]) {
                return a[1] - b[1]; // Menor duração primeiro
            }
            return a[2] - b[2]; // Menor tempo de chegada em caso de empate
        });
        
        let processoEscolhido = processosDisponiveis[0];
        let idProcesso = processoEscolhido[0];
        let duracao = processoEscolhido[1];
        
        // Calcula os tempos de execução no Gráfico de Gantt
        let inicioProcesso = tempoAtual;
        let fimProcesso = inicioProcesso + duracao;
        
        ganttCoordenadas.push([idProcesso, inicioProcesso, fimProcesso]);
        
        // Atualiza o tempo atual do sistema
        tempoAtual = fimProcesso;
        
        // Remove o processo que acabou de ser executado da lista de pendentes
        let index = processosRestantes.findIndex(p => p[0] === idProcesso);
        processosRestantes.splice(index, 1);
    }
    
    return ganttCoordenadas;

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