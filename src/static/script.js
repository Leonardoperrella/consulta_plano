let csvData = []; // Global variable to store CSV data

const fileInput = document.getElementById('csvFileInput');
const excelFileInput = document.getElementById('excelFileInput');
const searchInput = document.getElementById('searchInput');
const fileNameDisplay = document.getElementById('fileName'); // Add this line

excelFileInput.addEventListener('change', handleExcelFileSelect);
searchInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        searchData();
    }
});

fileInput.addEventListener('change', handleFileSelect);
// Remove window.addEventListener('load', loadDataFromStorage); as we are not using local storage

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        fileNameDisplay.textContent = ''; // Clear file name if no file selected
        return;
    }

    fileNameDisplay.textContent = file.name; // Display file name

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 0) {
            const headers = lines[0].split(';');
            csvData = lines.slice(1).map(line => {
                const values = line.split(';');
                const obj = {};
                for (let i = 0; i < headers.length; i++) {
                    obj[headers[i].trim()] = values[i].trim();
                }
                return obj;
            });
            console.log('CSV data loaded:', csvData);
        } else {
            alert('The file is empty or has no valid lines.');
        }
    };
    reader.readAsText(file);
}

async function handleExcelFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

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
            console.log(data)
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
        row.innerHTML = `
            <td>${item.cod_benef || ''}</td>
            <td>${item.nome_benef || ''}</td>
            <td>${item.cod_depend || ''}</td>
            <td>${item.nome_depend || ''}</td>
            <td>${item.matricula || ''}</td>
            <td>${item.tipo || ''}</td>
            <td>${item.sexo || ''}</td>
            <td>${item.dt_nasc || ''}</td>
            <td>${item.idade || ''}</td>
            <td>${item.inicio_vigencia || ''}</td>
            <td>${item.fim_vigencia || ''}</td>
            <td>${item.plano || ''}</td>
        `;
        resultsBody.appendChild(row);
    });
    document.getElementById('loading').style.display = 'none';
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