let csvData = []; // Global variable to store CSV data

const fileInput = document.getElementById('csvFileInput');
const excelFileInput = document.getElementById('excelFileInput');
const searchInput = document.getElementById('searchInput');
const fileNameDisplay = document.getElementById('fileName'); // Add this line
const excelFileNameDisplay = document.getElementById('excelFileName');

excelFileInput.addEventListener('change', handleExcelFileSelect);
searchInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        searchData();
    }
});

async function handleExcelFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

     if (!file) {
        excelFileNameDisplay.textContent = '';
        return;
    }
    excelFileNameDisplay.textContent = file.name;
    const formData = new FormData();
    formData.append('file', file); // 'file' é o nome do campo que o servidor espera
    try {
        document.getElementById('loading').style.display = 'block'; // Show loading
        const response = await fetch('/upload_excel', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            if (data.error) {
                alert('Erro ao processar o arquivo: ' + data.error);
            } else {
                displayResults(data); // Chama displayResults com os dados recebidos
            }
        } else {
            alert('Erro response ao enviar o arquivo para o servidor.');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Erro ao enviar o arquivo para o servidor.');
    } finally {
        document.getElementById('loading').style.display = 'none'; // Hide loading
    }
}

function displayResults(results) {
    const resultsBody = document.getElementById("resultsBody");
    resultsBody.innerHTML = '';
    if (!results || results.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="12">No results found</td>';
        resultsBody.appendChild(row);
    }
    results.forEach(item => {
        const row = document.createElement('tr');
        const formattedDtNasc = formatDate(item.dt_nasc);
        const formattedInicioVigencia = formatDate(item.inicio_vigencia);
        const formattedFimVigencia = formatDate(item.fim_vigencia);

        row.innerHTML = `
            <td>${item.cod_benef || ''}</td>
            <td>${item.nome_benef || ''}</td>
            <td>${item.cod_depend || ''}</td>
            <td>${item.nome_depend || ''}</td>
            <td>${item.matricula || ''}</td>
            <td>${item.tipo || ''}</td>
            <td>${item.sexo || ''}</td>
            <td>${formattedDtNasc || ''}</td>
            <td>${item.idade || ''}</td>
            <td>${formattedInicioVigencia || ''}</td>
            <td>${formattedFimVigencia || ''}</td>
            <td>${item.plano || ''}</td>
        `;
        resultsBody.appendChild(row);
    });
    document.getElementById('loading').style.display = 'none';
    attachCopyEventListeners();
}

function attachCopyEventListeners() {
    const cells = document.querySelectorAll('#resultsBody td');
    cells.forEach(cell => {
        cell.addEventListener('click', function() {
            const text = this.textContent;
            navigator.clipboard.writeText(text)
                .then(() => {
                   showToast(`Conteúdo copiado: ${text}`);
                })
                .catch(err => {

                    console.error('Failed to copy text: ', err);
                });
        });
    });
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
        toast.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background-color: #333; color: white; padding: 10px 20px; border-radius: 5px;
        opacity: 0.9; z-index: 1000; transition: opacity 0.5s ease-in-out;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500); // Remove the toast after fade out
    }, 2000); // Toast disappears after 2 seconds
}

async function searchData() {
    document.getElementById('loading').style.display = 'block';
    const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
    try {
        const response = await fetch(`/search?term=${searchTerm}`, {
            method: 'GET',
        });
        if (response.ok) {
            const data = await response.json();
            displayResults(data);
        } else {
            alert('Erro ao pesquisar no servidor.');
            document.getElementById('loading').style.display = 'none';
        }
    } catch (error) {
        console.error('Error searching data:', error);
        alert('Erro ao pesquisar no servidor.');
        document.getElementById('loading').style.display = 'none';
    }
}

function formatScientificString(str) {

    if (str === null || str === undefined || str === '' || str == '0') return '';

    // Remove vírgula e troca por ponto, se necessário (caso venha no formato "9,0000E+16")
    const normalized = str.replace(',', '.');

    // Converte para número
    const num = Number(normalized);

    // Verifica se é um número válido e retorna formatado
    return isNaN(num) ? str : num.toLocaleString('pt-BR');
}

function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    if (year && month && day)
        return `${day}/${month}/${year}`;
    return dateString
}