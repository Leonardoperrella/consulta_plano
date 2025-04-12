import io
import pandas as pd
import numpy as np
from flask import Flask, jsonify, request, render_template

app = Flask(
    __name__,
    static_folder='src/static',
    static_url_path='/static',
    template_folder='src/templates')

csv_data = []
excel_data = []


@app.route("/")
def index():
    return render_template('index.html')


@app.route("/upload_excel", methods=["POST"])
def upload_excel():
    try:
        print("Received upload_excel request")
        if "file" not in request.files:
            return jsonify({"error": "No file part"}), 400
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        if file and file.filename.endswith((".xlsx", ".xls")):
            print(f"Processing file: {file.filename}")
            df = pd.read_excel(file, header=6)
            df.columns = ['cod_benef', 'nome_benef', 'cod_depend', 'nome_depend', 'matricula',
                          'tipo', 'sexo', 'dt_nasc', 'idade', 'inicio_vigencia', 'fim_vigencia', 'plano']

            # Convert date columns to strings in isoformat
            date_columns = ['dt_nasc', 'inicio_vigencia', 'fim_vigencia']
            for col in date_columns:
                if col in df.columns:
                    try:
                        df[col] = pd.to_datetime(df[col], errors='coerce')
                        df[col] = df[col].dt.strftime('%Y-%m-%d').fillna('')
                    except Exception as error:
                        print(f"Error processing column {col}: {error}")
            df = df.replace({pd.NaT: '', np.nan: ''})
            data = df.to_dict(orient="records")
            global excel_data
            excel_data = data
            return jsonify(data)

        else:
            return jsonify({"error": "Invalid file format. Only Excel files are allowed."}), 400
    except Exception as e:
        print(e)
        return (
            jsonify({"error": "An error occurred while processing the file."}),
            500,
        )


@app.route('/search', methods=['GET'])
def search():
    term = request.args.get('term', '').lower()

    if not csv_data and not excel_data:
        return jsonify({'message': 'No data available. Please upload a CSV or Excel file.'})

    results = []

    # Search in CSV data if available
    if csv_data:
        results.extend([item for item in csv_data if
                        term in str(item.get('Matrícula', '')).lower() or
                        term in str(item.get('Nome Beneficiário', '')).lower()])

    # Search in Excel data if available
    if excel_data:
        results.extend([item for item in excel_data if
                        term in str(item.get('matricula', '')).lower() or
                        term in str(item.get('nome_benef', '')).lower()])

    # Remove duplicates based on the combined fields if any exist
    unique_results = {}
    for item in results:
        if isinstance(item, dict):  # Check if item is a dictionary
            key = tuple(item.items())
            if key not in unique_results:
                unique_results[key] = item
        else:
            # Log non-dictionary items
            print(f"Skipping non-dictionary item: {item}")

    return jsonify(list(unique_results.values()))


def main():
    app.run(port=5000)


if __name__ == "__main__":
    main()
