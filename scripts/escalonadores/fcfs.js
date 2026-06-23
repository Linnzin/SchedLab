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

function fcfs(arrayProcessos){
    arrayProcessos.sort((a, b) => (a[2] ?? 0) - (b[2] ?? 0))   
    
    let ganttCoordenadas = []; //[nome, inicio, fim]
    for(let i = 0; i < arrayProcessos.length; i++){
        idProcesso = arrayProcessos[i][0];
        
        let inicioProcesso = (i == 0) ? 0 : ganttCoordenadas[i-1][2];
        inicioProcesso = (arrayProcessos[i][2] > inicioProcesso) ? arrayProcessos[i][2] : inicioProcesso;
        
        fimProcesso = inicioProcesso + arrayProcessos[i][1];
        
        ganttCoordenadas.push([idProcesso, inicioProcesso, fimProcesso])
    }   
    return ganttCoordenadas;
}

//[[id do processo, duração do processo, tempo de chegada]]
let processosTeste = [["a", 14, 8], ["b", 21], ["c", 6, 1], ["d", 32, 90]];

// console.log(fcfs(processosTeste));


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