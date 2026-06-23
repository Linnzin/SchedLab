'use strict';

// Importando escalonadores
import { sjf } from './escalonadores/sjf.js';

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
            configuracaoEscalonador[id] = Number(e.target.value)
        } 

        console.log(configuracaoEscalonador);
})
})

///// ==========================================
///// ----------------- TABELA -----------------


// Array dos processos atuais para posterior processamento

let arrayProcessosTabela = [];

///// Elementos

const adicionarProcesso = document.querySelector('.btn-adicionar');
const removerProcesso = document.querySelector('.btn-remover');
const simularEscalonador = document.querySelector('.btn-simular');
const corpoTabela = document.querySelector('.tabela-agendamento__corpo');

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
    arrayProcessosTabela.pop();
    console.log(arrayProcessosTabela);
})

// Adiciona os processos somente com o tempo de chegada e execução na tabela de agendamento

adicionarProcesso.addEventListener('click', function (e) {

    // Impedir o processo de ser adicionado se possuir input vazio para cada tipo de escalonador

    if (configuracaoEscalonador.tempoChegada === null || configuracaoEscalonador.tempoExecucao === null) {
        window.alert("Erro: O Tempo de Chegada e o Tempo de Execução são obrigatórios!")
        return
    }

    const algoritmoSelecionado = e.target.dataset.algoritmo

    switch(algoritmoSelecionado){

        case "rr":
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
            break;

        case "sjf":
        case "fcfs":
            break;
            
        default:
            console.error("Algoritmo desconhecido selecionado.");
            return;
    }

    // Se o processo a ser adicionado for o primeiro, o ID será 1.
    // Se não for o primeiro, o id do processo a ser adicionado será o anterior incrementado por 1.
    const processoID = corpoTabela.childElementCount === 0 ? 1 : Number(Array.from(corpoTabela.children)[Array.from(corpoTabela.children).length - 1].children[0].textContent.slice(1)) + 1;

    arrayProcessosTabela.push({
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

    console.log(arrayProcessosTabela);

})

// Acionar simulação do escalonamento 

simularEscalonador.addEventListener('click', function() {

    if (arrayProcessosTabela.length === 0) {
        alert("Adicione pelo menos um processo para simular!");
        return;
    }

    const processosParaAlgoritmo = arrayProcessosTabela.map(proc => {
        return [
            proc.id, 
            proc.chegada, 
            proc.execucao, 
            configuracaoEscalonador.deadline || Infinity, 
            configuracaoEscalonador.prioridade || 0
        ];
    });

    const sobrecarga = configuracaoEscalonador.sobrecargaContexto || 0;

    const resultadoSimulacao = sjf(processosParaAlgoritmo, sobrecarga);

    console.log("Resultado Matemático:", resultadoSimulacao);

});

///// ==========================================