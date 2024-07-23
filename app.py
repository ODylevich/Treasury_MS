from flask import Flask, render_template, request, jsonify, redirect, url_for

app = Flask(__name__)


@app.route('/')
def index():
    return redirect(url_for('render_segmentManagement'))


@app.route('/segment-management')
def render_segmentManagement():
    return render_template('segmentManagement.html')


@app.route('/create_promo', methods=['POST'])
def create_promo():
    promocode_name = request.form.get('promo-name')
    promocode_validity = request.form.get('valid-till')
    promocode_max_trades = request.form.get('max-trades')
    promocode_ccy_pairs = request.form.get('valid-ccy-pairs')

    # Store data in a dictionary
    promo_data = {
        "promocodeName": promocode_name,
        "promocodeValidity": promocode_validity,
        "promocodeMaxTrades": promocode_max_trades,
        "promocodeCcyPairs": promocode_ccy_pairs.split(',')  # Convert comma-separated values to list
    }

    # Do something with the data (e.g., store it in a database)
    print(promo_data)
    # Return a response (e.g., redirect to another page or return JSON response)
    return redirect(url_for('render_segmentManagement'))


if __name__ == '__main__':
    app.run(debug=True)
