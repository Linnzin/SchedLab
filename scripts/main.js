'use strict';

// Elementos da configuração do escalonador | Entradas do usuário

let tempoChegada;
let tempoExecucao;
let quantum;
let prioridade;          
let deadline;            
let sobrecargaContexto;

/* const configuracaoEscalonador = {
    tempochegada: null,
    tempoexecucao: null,
    quantum: null,
    prioridade: null,
    deadline: null,
    sobrecargacontexto: null
}; */

const entradasInput = document.querySelectorAll('.entradas')

// Atualizar os valores

entradasInput.forEach(entrada => {
    entrada.addEventListener('change', function(e) {
/* 
        const id = e.target.id;

        if (id in configuracaoEscalonador) {
            configuracaoEscalonador
        } */

    // TODO: Remover esse monte de if | Pretendo fazer isso com o objeto configuracaoEscalonador

    
    if (e.target.id === 'tempochegada') {
        tempoChegada = Number(document.getElementById('tempochegada').value)
    }

    if (e.target.id === 'tempoexecucao') {
        tempoExecucao = Number(document.getElementById('tempoexecucao').value)
    }

    if (e.target.id === 'quantum') {
        quantum = Number(document.getElementById('quantum').value)
    }

    if (e.target.id === 'prioridade') {
            prioridade = Number(document.getElementById('prioridade').value);
        }

        if (e.target.id === 'deadline') { 
            deadline = Number(document.getElementById('deadline').value);
        }

        if (e.target.id === 'sobrecargacontexto') {
            sobrecargaContexto = Number(document.getElementById('sobrecargacontexto').value);
        }

        console.log(`Chegada: ${tempoChegada} | Execução: ${tempoExecucao} | Quantum: ${quantum} | Prioridade: ${prioridade} | Deadline: ${deadline} | Sobrecarga: ${sobrecargaContexto}`);
})
})

///// ==========================================
///// ----------------- TABELA -----------------


// Array dos processos atuais para posterior processamento

const arrayProcessosTabela = [];

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
    corpoTabela.lastElementChild?.remove();
    arrayProcessosTabela.pop();
    console.log(arrayProcessosTabela);
})

// Adiciona os processos somente com o tempo de chegada e execução na tabela de agendamento
adicionarProcesso.addEventListener('click', function () {
    // Se o processo a ser adicionado for o primeiro, o ID será 1.
    // Se não for o primeiro, o id do processo a ser adicionado será o anterior incrementado por 1.
    const processoID = corpoTabela.childElementCount === 0 ? 1 : Number(Array.from(corpoTabela.children)[Array.from(corpoTabela.children).length - 1].children[0].textContent.slice(1)) + 1;

    arrayProcessosTabela.push({
        id: processoID,
        chegada: tempoChegada,
        execucao: tempoExecucao,
    })

    const processoStart = htmlProcesso(processoID,tempoChegada,tempoExecucao,'','','','','','');

    corpoTabela.insertAdjacentHTML('beforeend', processoStart);

    console.log(arrayProcessosTabela);

})

///// ==========================================