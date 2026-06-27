export function fcfs(arrayProcessos) {
  arrayProcessos.sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0))

  let ganttCoordenadas = []; //[pid, inicio, fim]
  for (let i = 0; i < arrayProcessos.length; i++) {
    let idProcesso = arrayProcessos[i][0];

    let inicioProcesso = (i == 0) ? 0 : ganttCoordenadas[i - 1][2];
    inicioProcesso = (arrayProcessos[i][1] > inicioProcesso) ? arrayProcessos[i][1] : inicioProcesso;

    let fimProcesso = inicioProcesso + arrayProcessos[i][2];

    ganttCoordenadas.push([idProcesso, inicioProcesso, fimProcesso, false, false])
  }

  let tabelaFinal = [];

  const numeroPreempcoes = 0 // fcfs não é preemptivo

  return {tabelaFinal, ganttCoordenadas, numeroPreempcoes}
}
