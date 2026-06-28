'use strict';

//================ Importação dos Escalonadores ================
import { fcfs } from './escalonadores/fcfs.js'
import { sjf } from './escalonadores/sjf.js';
import { prioridade } from './escalonadores/prioridade.js';
import { robin } from './escalonadores/robin.js';
import { edf } from './escalonadores/edf.js';
import { proprio } from './escalonadores/proprio.js';

const schedulers = {
  "fcfs": fcfs,
  "sjf": sjf,
  "prioridade": prioridade,
  "robin": robin,
  "edf": edf,
  "proprio": proprio
}

//================ Leitura das Entradas ================
const entradasInput = document.querySelectorAll('.num-input')
const configuracaoEscalonador = {
  tempoChegada: null,
  tempoExecucao: null,
  quantum: null,
  prioridade: null,
  deadline: null,
  sobrecargaContexto: null
};

entradasInput.forEach(entrada => {
  entrada.addEventListener('change', function (e) {
    const id = e.target.id;
    if (id in configuracaoEscalonador) {
      configuracaoEscalonador[id] = e.target.value === '' ? null : Number(e.target.value)
    }
  })
})

//================ Elementos HTML ================
const btnAddRow = document.querySelector('.btn-adicionar');
const btnRemoveRow = document.querySelector('.btn-remover');
const btnSimulate = document.querySelector('.btn-simular');
const processTable = document.querySelector('.tabela-agendamento__corpo');
const divGantt = document.querySelector('.gantt')

//================ Funções utilitárias ================ 
// função: calcula as informações para o resumo qunatitativo
function calcularMetricasGlobais(processosCalculados, numeroPreempcoes) {

  // processosCalculados será o array de objetos contendo os resultados do escalonamento para cada processo
  // numeroPreempcoes será uma das saídas de cada algoritmo

  const totalProcessos = processosCalculados.length
  const somaEspera = processosCalculados.reduce((acc, p) => acc + p.espera, 0)
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

// função: incrementar linhas da tabela
function htmlTableRows(pid, chegada, execucao, deadline, prioridade, termino, espera, turnaround, deadline_ok) {
  return `<tr>
            <td>${pid}</td>
            <td>${chegada}</td>
            <td>${execucao}</td>
            <td>${deadline}</td>
            <td>${prioridade}</td>
            <td>${termino}</td>
            <td>${espera}</td>
            <td>${turnaround}</td>
            <td>${deadline_ok}</td>
          </tr>`
};

// função: validar as entradas do usuário
function schedulerValidation(scheduler) {
  switch (scheduler) {
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
};

// função: executa o escalonador
function execScheduler(scheduler, processes) {
  return scheduler(processes)
}

// função: atualiza a tabela de resumo quantitativo
function upadateMetricTable(resultadoMetricasGlobais) {
  const cell = Array.from(document.querySelectorAll('.tabela-mediasglobais td'));
  cell[0].textContent = resultadoMetricasGlobais.mediaEspera;
  cell[1].textContent = resultadoMetricasGlobais.mediaTurnaround;
  cell[2].textContent = resultadoMetricasGlobais.throughput;
  cell[3].textContent = `${resultadoMetricasGlobais.percentualOcioso}%`;
  cell[4].textContent = resultadoMetricasGlobais.numeroPreempcoes;
}

// função: atualiza a tabela de processos
function upadateProcessTable(processTable, resultadoTabela) {
  const processTableArray = Array.from(processTable.children);
  for (let i = 0; i < resultadoTabela.length; i++) {
    const cell = Array.from(processTableArray[i].children);
    cell[5].textContent = resultadoTabela[i].termino;
    cell[6].textContent = resultadoTabela[i].espera;
    cell[7].textContent = resultadoTabela[i].turnaround;
    cell[8].textContent = resultadoTabela[i].deadlineOk;
  }
}

// função: gera diagrama de gantt
function ganttChart(processArray, scheduler) {

  function blockName(process) {
    if (process[3]) { return `PID: ${process[0]} (Esperando)` }
    if (process[4]) { `Troca de Contexto (Sobrecarga)` }
    if (process[5]) { `PID: ${process[0]} (Fora do Prazo — Deadline Estourada)` }
    return `PID: ${process[0]} (Execução)`
  }

  function blockColor(process) {
    // espera
    if (process[3]) {
      return {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, 'hsla(60, 80%, 60%, 0.2)'],
          [1, 'hsla(60, 80%, 30%, 0.2)']
        ]
      };
    }
    // troca de contexto
    if (process[4]) {
      return {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, 'hsl(0, 80%, 60%)'],
          [1, 'hsl(0, 80%, 30%)']
        ]
      };
    }
    // deadline estourada
    if (process[5]) {
      return {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: [
          [0, 'hsl(240, 5%, 60%)'],
          [1, 'hsl(240, 5%, 30%)']
        ]
      };
    }
    // execução
    return {
      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
      stops: [
        [0, 'hsl(140, 80%, 60%)'],
        [1, 'hsl(140, 80%, 30%)']
      ]
    };
  }

  let deadlineIds = []
  Highcharts.chart('gantt-chart', {
    chart: {
      type: 'gantt',
      backgroundColor: 'transparent',
      height: 400,
      width: null
    },
    title: {
      text: scheduler.toUpperCase(),
      style: {
        color: 'var(--cor-texto-main)',
        fontWeight: 'bold',
        fontFamily: 'inherit'
      }
    },
    xAxis: {
      min: 0,
      max: Math.max(...processArray.map(proc => proc[2])),
      lineWidth: 1,
      lineColor: 'var(--cor-texto-main)',
      tickInterval: 5,
      gridLineWidth: 1.5,
      gridLineColor: 'var(--cor-texto-main)',
      minorTickInterval: 1,
      minorGridLineWidth: 1,
      minorGridLineColor: 'var(--cor-texto-main)',
      gridZIndex: 5,
      labels: {
        style: {
          color: 'var(--cor-texto-main)',
          fontWeight: 'bold'
        }
      },
      // linha da deadline
      plotLines: processArray.flatMap(proc => {
        if (!proc[4] || deadlineIds.includes(proc[0])) {
          return [];
        }
        deadlineIds.push(proc[0]);
        return [
          {
            value: proc[1],
            color: 'hsl(0, 80%, 30%)',
            width: 2,
            zIndex: 6,
          }
        ];
      },
      )
    },
    yAxis: {
      title: '',
      categories: Array.from({ length: Math.max(...processArray.map(p => p[0])) }, (_, i) => `ID: ${i + 1}`),
      gridLineWidth: 1
    },
    legend: {
      enabled: false
    },
    plotOptions: {
      series: {
        pointPadding: 0.1,
        groupPadding: 0.1
      }
    },
    // dados para o diagrama
    series: [
      {
        name: '',
        showInLegend: false,
        borderWidth: 2,
        data: processArray.flatMap(proc => [
          {
            name: blockName(proc),
            start: proc[1],
            end: proc[2],
            y: proc[0] - 1, // primeira linha = 0
            color: blockColor(proc),
          }
        ])
      }
    ],
    // informações que seguem o mouse
    tooltip: {
      followPointer: true,
      formatter: function () {
        return '<b>' + this.point.name + '</b><br/>' +
          'Início: ' + this.point.start + '<br/>' +
          'Fim: ' + this.point.end;
      },
      backgroundColor: 'var(--cor-base-main)',
      style: {
        color: 'var(--cor-texto-main)',
        fontFamily: 'inherit'
      }
    },
    credits: {
      enabled: false
    }
  });
}

//================ Event Listeners ================ 
let processArray = [];

// evento: remove linha da tabela
btnRemoveRow.addEventListener('click', function () {
  // trocar isso por uma indicação visual via css
  // if (processTable.childElementCount === 0) {
  //   window.alert("Não há processos para remover!")
  //   return
  // }
  processTable.lastElementChild?.remove();
  processArray.pop();
})

// evento: adiciona linha na tabela
btnAddRow.addEventListener('click', function (e) {
  if (configuracaoEscalonador.tempoChegada === null || configuracaoEscalonador.tempoExecucao === null) {
    window.alert("Erro: O Tempo de Chegada e o Tempo de Execução são obrigatórios!")
    return
  }

  schedulerValidation(e.target.dataset.algoritmo);
  let pid = processArray.length + 1;

  processArray.push([pid,
    configuracaoEscalonador.tempoChegada,
    configuracaoEscalonador.tempoExecucao,
    configuracaoEscalonador.prioridade,
    configuracaoEscalonador.deadline,
    configuracaoEscalonador.quantum])

  const processoStart = htmlTableRows(pid,
    configuracaoEscalonador.tempoChegada,
    configuracaoEscalonador.tempoExecucao,
    configuracaoEscalonador.deadline || '-',
    configuracaoEscalonador.prioridade || '-',
    '-', '-', '-', '-');

  processTable.insertAdjacentHTML('beforeend', processoStart);
})

// evento: simula escalonador 
btnSimulate.addEventListener('click', function (e) {
  if (processArray.length === 0) {
    alert("Adicione pelo menos um processo para simular!"); // to do: trocar essa guard clause por uma indicação visaul via css e bloquear o botao
    return;
  }
  const resultadoSimulacao = execScheduler(schedulers[e.target.dataset.algoritmo], processArray);

  let resultadoTabela = resultadoSimulacao.tabelaFinal;
  resultadoTabela = resultadoTabela.toSorted((a, b) => a.pid - b.pid);
  const resultadoMetricasGlobais = calcularMetricasGlobais(resultadoTabela, resultadoSimulacao.numeroPreempcoes)

  upadateProcessTable(processTable, resultadoTabela);
  upadateMetricTable(resultadoMetricasGlobais);
  ganttChart(resultadoSimulacao.ganttCoordenadas, e.target.dataset.algoritmo);

  divGantt.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
});
