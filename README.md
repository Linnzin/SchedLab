# 🖥️ Simulador de Escalonamento de Processos

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Sistemas Operacionais](https://img.shields.io/badge/SO-MATA58-blue.svg)]()

Uma aplicação web interativa desenvolvida em JavaScript para simular, visualizar e analisar quantitativamente o comportamento de algoritmos de escalonamento de processos em sistemas operacionais. 

Este projeto foi desenvolvido como parte dos requisitos práticos da disciplina **MATA58 - Sistemas Operacionais**.

---

## 🔗 Demonstração

💻 **[Acesse o simulador](URL_DO_GITHUB_PAGES_OU_DEPLOY)**

*(Substitua esta linha por um link para o seu site no GitHub Pages)*

---

## 📸 Visualização da Interface

![Gráfico de Gantt e Tabela de Métricas](URL_DE_UM_PRINT_OU_GIF_DO_APP)

*(Tire um print nítido do gráfico de Gantt rodando e coloque o caminho da imagem aqui)*

---

## 🚀 Funcionalidades e Algoritmos

O simulador foi construído utilizando o paradigma de **Simulação de Eventos Discretos**, garantindo precisão matemática no cálculo dos tempos do sistema.

### Algoritmos Implementados:
1. **FIFO/FCFS** (First Come, First Served) - *Não preemptivo*.
2. **SJF** (Shortest Job First) - *Não preemptivo*.
3. **Prioridade** - *Não preemptivo*.
4. **Round-Robin** - *Preemptivo com quantum fixo*.
5. **EDF** (Earliest Deadline First) - *Preemptivo*.
6. **[Nome do Algoritmo Próprio]** - *Algoritmo preemptivo autoral desenvolvido pela equipe*.

### Funcionalidades Técnicas:
* **Entradas Dinâmicas:** Permite configurar atributos por processo (ID, Tempo de Chegada, Tempo de Execução, Prioridade e Deadline).
* **Parâmetros Globais:** Permite configurar o `quantum` e `sobrecarga_contexto`.
* **Gráfico de Gantt Interativo:** Renderização visual seguindo a especificação de cores:
  * 🟩 Verde: Execução de Processo.
  * 🟥 Vermelho: Sobrecarga de Contexto.
  * ⬛ Cinza: Estouro de Deadline.
  * 🛑 Linha Vertical: Indicação de Deadline.
* **Métricas Completas:** Geração automática de relatórios de desempenho individuais e estatísticas globais (Turnaround, Tempo de Espera, Throughput e % de Ociosidade).

---

## 📂 Organização do Código

O projeto foi estruturado de forma modular, buscando separar a lógica matemática de escalonamento da camada de manipulação visual:

* **`/script/escalonadores/`**: Contém a lógica pura dos simuladores (funções de escalonamento de cada algoritmo).
* **`/html/`**: Gerenciamento da interface, captura dos inputs do usuário e renderização dinâmica do Gráfico de Gantt no DOM.
* **`/script/main.js`**: Funções auxiliares para cálculo automatizado das métricas quantitativas.

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem Principal:** JavaScript (ES6+)
* **Interface e Estilização:** HTML5 / CSS3

---

## 💻 Como Executar o Projeto Localmente

Como a aplicação foi desenvolvida puramente em ambiente web, executá-la é extremamente simples.

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/Linnzin/escalonadores_so.git

# 2. Acesse o diretório do projeto
cd escalonadores_so

# 3. Abra o arquivo index.html diretamente no seu navegador, ou se usar npm:
# npm install
# npm run dev
```
## 👥 Autores
Desenvolvido por:

Lincoln Pereira da Silva - [GitHub](https://github.com/Linnzin) | [LinkedIn](https://www.linkedin.com/in/lincolnps21/)

Guilherme de Santana Soares Xavier - [GitHub](https://github.com/DasGestirn) | [LinkedIn](https://www.linkedin.com/in/guilherme-xavier-61a54639a/)

Jacques Barreto Salah - [GitHub](https://github.com/JacquesSalah) | [LinkedIn](https://www.linkedin.com/in/jacques-salah/)

## 📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.