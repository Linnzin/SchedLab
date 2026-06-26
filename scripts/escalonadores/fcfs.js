export function fcfs(arrayProcessos) {
  arrayProcessos.sort((a, b) => (a[2] ?? 0) - (b[2] ?? 0))

  let ganttCoordenadas = []; //[nome, inicio, fim]
  for (let i = 0; i < arrayProcessos.length; i++) {
    let idProcesso = arrayProcessos[i][0];

    let inicioProcesso = (i == 0) ? 0 : ganttCoordenadas[i - 1][2];
    inicioProcesso = (arrayProcessos[i][2] > inicioProcesso) ? arrayProcessos[i][2] : inicioProcesso;

    let fimProcesso = inicioProcesso + arrayProcessos[i][1];

    ganttCoordenadas.push([idProcesso, inicioProcesso, fimProcesso, false, false])
  }
  return ganttCoordenadas;
}

//[[id do processo, duração do processo, tempo de chegada]]
// let processosTeste = [[1, 14, 8], [2, 21], [4, 32, 90], [3, 6, 1]];
// let coordsteste = fcfs(processosTeste)
// console.log(coordsteste)

// let coordsteste = [
//   [1, 0, 4, false, false], // processo 1: 4/12 (deadline = 50)
//   [1, 4, 5, true, false], // bloco vermelho - troca de contexto
//   [2, 5, 9, false, false], // processo 2: 4/8 (deadline = 16)
//   [2, 9, 10, true, false], // bloco vermelho - troca de contexto
//   [1, 10, 14, false, false], //processo 1: 8/12 (deadline = 50)
//   [1, 14, 15, true, false], // bloco vermelho - troca de contexto
//   [2, 15, 16, false, false], // processo 2: 5/8 (deadline = 16)
//   [2, 16, 19, false, true], // processo 2: 8/8 (bloco cinza, passou da deadline) (sem sobrecarga, pois acabou)
//   [1, 19, 23, false, false], //processo 1: 12/12 (deadline = 50)
// ]

// const simularEscalonador = document.querySelector('.btn-simular');
// simularEscalonador.addEventListener('click', () => ganttChart(coordsteste, "FCFS"))

function ganttChart(processes, escalonador) {

  let deadlineIds = []

  Highcharts.chart('gantt-chart', {
    chart: {
      type: 'gantt',
      backgroundColor: 'hsl(0, 0%, 100%)',
      height: 400,
      width: null
    },
    title: {
      text: escalonador
    },
    xAxis: {
      min: 0,
      max: processes.at(-1)[2], // tempo final do último da lista 
      tickInterval: 5,
      gridLineWidth: 1,
      plotLines: processes.flatMap(proc => {
        if (!proc[4] || deadlineIds.includes(proc[0])) {
          return [];
        }
        deadlineIds.push(proc[0]);
        console.log(deadlineIds)
        return [
          {
            value: proc[1],
            color: 'red',
            width: 2,
            zIndex: 5
          }
        ];
      })
    },
    yAxis: {
      title: '',
      categories: processes.map(proc => `ID: ${proc[0]}`),
      gridLineWidth: 1
    },
    legend: {
      enabled: false,
    },
    plotOptions: {
      series: {
        pointPadding: 0.1,
        groupPadding: 0.1
      }
    },
    series: [{
      name: escalonador,
      data: processes.flatMap(proc => [
        {
          name: (!proc[4]) ? ((!proc[3]) ? `ID: ${proc[0]}` : 'Troca de Contexto (Sobrecarga)') : `ID: ${proc[0]} - Fora do Prazo`,
          start: proc[1],
          end: proc[2],
          y: proc[0] - 1, // primeira linha = 0
          color: (!proc[4]) ? ((!proc[3]) ? 'green' : 'red') : 'gray'
        }
      ])
    }],
    tooltip: {
      formatter: function () {
        return '<b>' + this.point.name + '</b><br/>' +
          'Início: ' + this.point.start + '<br/>' +
          'Fim: ' + this.point.end;
      }
    },
    credits: {
      enabled: false
    }
  });
}
