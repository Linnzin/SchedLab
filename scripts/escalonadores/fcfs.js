export function fcfs(arrayProcessos) {
  arrayProcessos.sort((a, b) => (a[2] ?? 0) - (b[2] ?? 0))

  let ganttCoordenadas = []; //[nome, inicio, fim]
  for (let i = 0; i < arrayProcessos.length; i++) {
    let idProcesso = arrayProcessos[i][0];

    let inicioProcesso = (i == 0) ? 0 : ganttCoordenadas[i - 1][2];
    inicioProcesso = (arrayProcessos[i][2] > inicioProcesso) ? arrayProcessos[i][2] : inicioProcesso;

    let fimProcesso = inicioProcesso + arrayProcessos[i][1];

    ganttCoordenadas.push([idProcesso, inicioProcesso, fimProcesso])
  }
  return ganttCoordenadas;
}

//[[id do processo, duração do processo, tempo de chegada]]
let processosTeste = [[1, 14, 8], [2, 21], [3, 6, 1], [4, 32, 90]];


let processes = fcfs(processosTeste)

console.log(processes)

// function ganttChart() {
// }

document.addEventListener('DOMContentLoaded', () => {
  Highcharts.chart('gantt-chart', {
    chart: {
      type: 'gantt',
      backgroundColor: 'hsl(0, 0%, 100%)',
      height: 400,
      width: null
    },
    title: {
      text: ''
    },
    xAxis: {
      min: 0,
      max: processes.at(-1)[3],
      tickInterval: 5,
      gridLineWidth: 1,
      // plotLines: [                // Linhas verticais -- DEADLINE
      //   {
      //     value: 3,           // Onde a linha vai passar no eixo X
      //     color: 'red',
      //     width: 2,
      //     zIndex: 5           // Garante que fica por cima dos blocos
      //   }
      // ]
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
      name: 'FCFS', // Nome da série para a legenda
      data: processes.flatMap(proc => [
        {
          name: `ID: ${proc[0]}`,
          start: proc[1],
          end: proc[2],
          y: proc[0] - 1,
          color: 'green',
        }
        // TODO: TERMINAR TROCA DE CONTEXTO
        // {
        //   name: 'Troca de Contexto',
        //   start: proc[2],
        //   end: proc[2] + 1,
        //   y: proc[0] - 1,
        //   color: 'red',
        // }
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
});