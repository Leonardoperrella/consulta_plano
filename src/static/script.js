let csvData = []; // Global variable to store CSV data

const fileInput = document.getElementById('csvFileInput');
const searchInput = document.getElementById('searchInput');
const fileNameDisplay = document.getElementById('fileName'); // Add this line

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

async function searchData() {
    document.getElementById('loading').style.display = 'block';

    if (!csvData || csvData.length === 0) {
        alert('Please select a CSV file first.');
        document.getElementById('loading').style.display = 'none';
        return;
    }
    const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
    const results = csvData.filter(item => {
        const matricula = item['Matrícula'] ? item['Matrícula'].toLowerCase() : '';
        const nome = item['Nome Beneficiário'] ? item['Nome Beneficiário'].toLowerCase() : '';
        return matricula.includes(searchTerm) || nome.includes(searchTerm);
    });

    displayResults(results);
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

function displayResults(results) {
    const resultsBody = document.getElementById("resultsBody");
    resultsBody.innerHTML = '';

    results.forEach(item => {
        const row = document.createElement('tr');
        const formattedBeneficiario = formatScientificString(item['Código do Beneficiário']);
        const formattedDependente = formatScientificString(item['Código do Dependente']);

        row.innerHTML = `
            <td>${formattedBeneficiario || ''}</td>
            <td>${item['Nome Beneficiário'] || ''}</td>
            <td>${formattedDependente || ''}</td>
            <td>${item['Nome Dependente'] || ''}</td>
            <td>${item['Matrícula'] || ''}</td>
            <td>${item['Tipo'] || ''}</td>
            <td>${item['Sexo'] || ''}</td>
            <td>${item['Dt. Nascimento'] || ''}</td>
            <td>${item['Idade'] || ''}</td>
            <td>${item['Início Vigência'] || ''}</td>
            <td>${item['Fim Vigência'] || ''}</td>
            <td>${item['Plano'] || ''}</td>
        `;
        resultsBody.appendChild(row);
    });
    document.getElementById('loading').style.display = 'none';
}