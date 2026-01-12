async function carregarCSV(url) {
    const resposta = await fetch(url);
    const texto = await resposta.text();
    const linhas = texto.trim().split("\n").map(l => l.split(","));
    linhas.shift();
    return linhas;
}

async function carregarDados() {

    const urlMetas = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRcLNQFvJLuIBAte0oPrNXz453WH_acpQsPvl9YucLV84YkRARi2hiQO-3iRnzUiccbcDE7drCDkiyC/pub?output=csv";
    const urlReais = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAW0x8y2XBHw0xQLpWLqeeZ96o3wRGzl4RcbnHzusoVXoK8ZQKSYWrbvn2fhRr6qZm0OLdjxeD8N_-/pub?output=csv";

    try {
        const metas = await carregarCSV(urlMetas);
        const reais = await carregarCSV(urlReais);

        const linhasHTML = document.querySelectorAll("tbody tr");

        metas.forEach((linhaMeta, i) => {
            if (!linhasHTML[i]) return;

            let linhaReal = reais[i];
            let colunasHTML = linhasHTML[i].querySelectorAll("td");

            // RCA e Nome
            colunasHTML[0].textContent = linhaMeta[0];
            colunasHTML[1].textContent = linhaMeta[1];

            let indexHTML = 2;

            // Preenche valores das metas e reais
            for (let j = 2; j < linhaMeta.length; j++) {

                let meta = Number(linhaMeta[j].replace(".", "").replace(",", "."));
                let real = Number(linhaReal[j].replace(".", "").replace(",", "."));
                let perc = meta > 0 ? ((real / meta) * 100).toFixed(1) + "%" : "0%";

                colunasHTML[indexHTML].textContent = meta;
                colunasHTML[indexHTML + 1].textContent = real;
                colunasHTML[indexHTML + 2].textContent = perc;

                indexHTML += 3;
            }
        });

        // -------------------------------------------------------------
        //  🔵 SOMA TOTAL GERAL + % TOTAL
        // -------------------------------------------------------------

        const totalRow = document.querySelector(".total-geral");
        if (totalRow) {
            let totalCells = totalRow.querySelectorAll("th:not(:first-child):not(:nth-child(2))");
            let totais = new Array(totalCells.length).fill(0);

            linhasHTML.forEach((linha) => {
                if (linha.classList.contains("linha-cinza") || linha.classList.contains("total-geral")) return;

                let cells = linha.querySelectorAll("td");

                for (let i = 2; i < cells.length; i += 3) {
                    let meta = Number(cells[i].textContent) || 0;
                    let real = Number(cells[i + 1].textContent) || 0;

                    let idxMeta = i - 2;
                    let idxReal = idxMeta + 1;
                    let idxPerc = idxMeta + 2;

                    // Soma META
                    if (totais[idxMeta] !== undefined) totais[idxMeta] += meta;

                    // Soma REAL
                    if (totais[idxReal] !== undefined) totais[idxReal] += real;

                    // (% será calculado depois)
                }
            });

            // Agora escrever META, REAL e % TOTAL
            for (let i = 0; i < totais.length; i += 3) {

                let metaTotal = totais[i];
                let realTotal = totais[i + 1];
                let percTotal = (metaTotal > 0)
                    ? ((realTotal / metaTotal) * 100).toFixed(1) + "%"
                    : "0%";

                // Escreve no HTML
                totalCells[i].textContent = metaTotal;
                totalCells[i + 1].textContent = realTotal;
                totalCells[i + 2].textContent = percTotal;
            }
        }

        console.log("Dados atualizados com sucesso!");

    } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
    }
}

carregarDados();
