from flask import Flask, render_template


app = Flask(
    __name__,
    static_folder='src/static',
    static_url_path='/static',
    template_folder='src/templates')


@app.route("/")
def index():
    return render_template('index.html')


def main():
    app.run(port=5000)


if __name__ == "__main__":
    main()
