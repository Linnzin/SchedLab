'use strict';

// Importando escalonadores

import { fcfs } from './escalonadores/fcfs.js'
import { sjf } from './escalonadores/sjf.js';
import { prioridade } from './escalonadores/prioridade.js';
import { robin } from './escalonadores/robin.js';
import { edf } from './escalonadores/edf.js';
import { proprio } from './escalonadores/proprio.js';


// Elementos da configuração do escalonador | Entradas do usuário

const configuracaoEscalonador = {
    tempoChegada: null,
    tempoExecucao: null,
    quantum: null,
    prioridade: null,
    deadline: null,
    sobrecargaContexto: null
}; 

const entradasInput = document.querySelectorAll('.entradas')

// Atualizar os valores

entradasInput.forEach(entrada => {
    entrada.addEventListener('change', function(e) {

        const id = e.target.id;

        if (id in configuracaoEscalonador) {
            configuracaoEscalonador[id] = e.target.value === '' ? null : Number(e.target.value)
        } 
})
})

///// ==========================================
///// ----------------- TABELA -----------------


// Array dos processos atuais para posterior processamento

let processosTabelaInicial = [];

///// Elementos

const adicionarProcesso = document.querySelector('.btn-adicionar');
const removerProcesso = document.querySelector('.btn-remover');
const simularEscalonador = document.querySelector('.btn-simular');
const corpoTabela = document.querySelector('.tabela-agendamento__corpo');

// Funções utilitárias

function calcularMetricasGlobais(processosCalculados, numeroPreempcoes) {

    // processosCalculados será o array de objetos contendo os resultados do escalonamento para cada processo
    // numeroPreempcoes será uma das saídas de cada algoritmo

    const totalProcessos = processosCalculados.length

    const somaEspera = processosCalculados.reduce((acc, p) => acc + p.espera,0)
    const somaTurnaround = processosCalculados.reduce((acc, p) => acc + p.turnaround, 0);
    const somaExecucao = processosCalculados.reduce((acc, p) => acc + p.execucao, 0);

    const tempoTotalSimulacao = Math.max(...processosCalculados.map(p => p.termino));

    const mediaEspera = (somaEspera / totalProcessos).toFixed(2)
    const mediaTurnaround = (somaTurnaround / totalProcessos).toFixed(2)
    const throughput = (totalProcessos / tempoTotalSimulacao).toFixed(2);

    const tempoTotalOcioso = tempoTotalSimulacao - somaExecucao;
    const percentualOcioso = ((tempoTotalOcioso / tempoTotalSimulacao) * 100).toFixed(2);

    return {
        mediaEspera,
        mediaTurnaround,
        throughput,
        percentualOcioso,
        numeroPreempcoes: numeroPreempcoes
    }

};

// HTML das filas dos processos

function htmlProcesso(id,chegada,execucao,deadline,prioridade,termino,espera,turnaround,deadline_ok) {
    return `
     <tr>
                        <td>P${id}</td>
                        <td>${chegada}</td>
                        <td>${execucao}</td>
                        <td>${deadline}</td>
                        <td>${prioridade}</td>
                        <td>${termino}</td>
                        <td>${espera}</td>
                        <td>${turnaround}</td>
                        <td>${deadline_ok}</td>
                    </tr>
    `
}

///// Lógica

// Remove o último processo presente na tabela de agendamento
removerProcesso.addEventListener('click', function() {

    if (corpoTabela.childElementCount === 0) {
        window.alert("Não há processos para remover!")
        return
    }
    corpoTabela.lastElementChild?.remove();
    processosTabelaInicial.pop();
    console.log(processosTabelaInicial);
})

adicionarProcesso.addEventListener('click', function (e) {

    // Impedir o processo de ser adicionado se possuir input vazio para cada tipo de escalonador

    if (configuracaoEscalonador.tempoChegada === null || configuracaoEscalonador.tempoExecucao === null) {
        window.alert("Erro: O Tempo de Chegada e o Tempo de Execução são obrigatórios!")
        return
    }

    const algoritmoSelecionado = e.target.dataset.algoritmo

    switch(algoritmoSelecionado){

        case "robin":
            if (configuracaoEscalonador.quantum === null || configuracaoEscalonador.quantum <= 0) {
                window.alert("Erro: O algoritmo Round Robin exige um valor válido para o Quantum!");
                return;
            }
            break;

        case "prioridade":
            if (configuracaoEscalonador.prioridade === null) {
                alert("Erro: Informe a Prioridade para adicionar o processo.");
                return;
            }
            break;

        case "edf":
            if (configuracaoEscalonador.deadline === null) {
                alert("Erro: O algoritmo EDF exige que o Deadline seja informado!");
                return;
            }
            if (configuracaoEscalonador.quantum === null || configuracaoEscalonador.quantum <= 0) {
                window.alert("Erro: O algoritmo EDF exige um valor válido para o Quantum!");
                return;
            }
            break;

        case "sjf":
            break;
        case "fcfs":
            break;
            
        default:
            console.error("Algoritmo desconhecido selecionado.");
            return;
    }

    // Se o processo a ser adicionado for o primeiro, o ID será 1.
    // Se não for o primeiro, o id do processo a ser adicionado será o anterior incrementado por 1.
    const processoID = corpoTabela.childElementCount === 0 ? 1 : Number(Array.from(corpoTabela.children)[Array.from(corpoTabela.children).length - 1].children[0].textContent.slice(1)) + 1;

    processosTabelaInicial.push({
        id: processoID,
        chegada: configuracaoEscalonador.tempoChegada,
        execucao: configuracaoEscalonador.tempoExecucao,
        prioridade: configuracaoEscalonador.prioridade,
        deadline: configuracaoEscalonador.deadline
    })

    const processoStart = htmlProcesso(processoID,
        configuracaoEscalonador.tempoChegada,
        configuracaoEscalonador.tempoExecucao,
        configuracaoEscalonador.deadline || '-', 
        configuracaoEscalonador.prioridade || '-', 
        '-', '-', '-', '-');

    corpoTabela.insertAdjacentHTML('beforeend', processoStart);

    console.log(processosTabelaInicial);

})

// Acionar simulação do escalonamento 

simularEscalonador.addEventListener('click', function(e) {

    // Guard clause para impedir a simulação sem processos

    if (processosTabelaInicial.length === 0) {
        alert("Adicione pelo menos um processo para simular!");
        return;
    }

    const algoritmoSelecionado = e.target.dataset.algoritmo

    const processosParaAlgoritmo = processosTabelaInicial.map(proc => {
        return [
            proc.id, 
            proc.chegada, 
            proc.execucao, 
            configuracaoEscalonador.deadline || Infinity, 
            configuracaoEscalonador.prioridade || 0
        ];
    });

    const sobrecarga = configuracaoEscalonador.sobrecargaContexto || 0;
    const quantum = configuracaoEscalonador.quantum || 2;
    let resultadoSimulacao

    // Coletar resultados do escalonamento a depender do algoritmo selecionado

    switch(algoritmoSelecionado) {
        case 'sjf':
            resultadoSimulacao = sjf(processosParaAlgoritmo, sobrecarga);
            break;
        case 'robin':
            resultadoSimulacao = robin(processosParaAlgoritmo, quantum, sobrecarga);
            break;
        case 'edf':
            resultadoSimulacao = edf(processosParaAlgoritmo, sobrecarga, quantum);
            break
    }

    const linhasHtml = Array.from(corpoTabela.children);
    const celulasMetricasGlobais = Array.from(document.querySelectorAll('.tabela-mediasglobais td'));

    const resultadoTabela = resultadoSimulacao.tabelaFinal;

    // Ordena os resultados pelo atributo do ID
    const resultadoTabelaOrdenado = resultadoTabela.toSorted((a,b) => a.pid - b.pid);
    console.log(resultadoTabelaOrdenado)
    
    // Calcular métricas globais
    const numeroPreempcoes = resultadoSimulacao.numeroPreempcoes;
    const resultadoMetricasGlobais = calcularMetricasGlobais(resultadoTabelaOrdenado,numeroPreempcoes)

    console.log(resultadoMetricasGlobais)

    // Atualizar os dados individuais de cada processo após a simulação

    for(let i = 0; i < resultadoTabelaOrdenado.length; i++) {
        
        const conteudoLinhaAtual = Array.from(linhasHtml[i].children)
        
        // Adiciona tempo de término na linha do processo
        conteudoLinhaAtual[5].textContent = resultadoTabelaOrdenado[i].termino

        // Tempo de espera
        conteudoLinhaAtual[6].textContent = resultadoTabelaOrdenado[i].espera

        // Turnaround individual do processo
        conteudoLinhaAtual[7].textContent = resultadoTabelaOrdenado[i].turnaround

        // Deadline_ok?
        conteudoLinhaAtual[8].textContent = resultadoTabelaOrdenado[i].deadlineOk

    }

    // Inserir as métricas globais na tabela menor

    celulasMetricasGlobais[0].textContent = resultadoMetricasGlobais.mediaEspera
    celulasMetricasGlobais[1].textContent = resultadoMetricasGlobais.mediaTurnaround
    celulasMetricasGlobais[2].textContent = resultadoMetricasGlobais.throughput
    celulasMetricasGlobais[3].textContent = resultadoMetricasGlobais.percentualOcioso
    celulasMetricasGlobais[4].textContent = resultadoMetricasGlobais.numeroPreempcoes


});

///// ==========================================