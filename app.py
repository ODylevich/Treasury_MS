from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from utils.loader import create_app, PromocodeTableService


app = create_app()


@app.route('/')
def index():
    return redirect(url_for('render_segmentManagement'))


@app.route('/segment-management')
def render_segmentManagement():
    message = request.args.get('message')
    error = request.args.get('error')
    return render_template('segmentManagement.html', message=message, error=error)


@app.route('/create_promo', methods=['POST'])
def create_promo():
    promocode_name = request.form.get('promo-name')
    promocode_validity = request.form.get('valid-till')
    promocode_max_trades = request.form.get('max-trades')
    promocode_ccy_pairs = request.form.get('valid-ccy-pairs')

    #for logging
    promo_data = {
        "promocodeName": promocode_name,
        "promocodeValidity": promocode_validity,
        "promocodeMaxTrades": promocode_max_trades,
        "promocodeCcyPairs": promocode_ccy_pairs.split(',')  # Convert comma-separated values to list
    }
    print(promo_data)
    # Store recieved data in database
    result = PromocodeTableService.create_promocode(name=promocode_name,
                                           valid_till=promocode_validity,
                                           max_trades=promocode_max_trades,
                                           valid_ccy_pairs=promocode_ccy_pairs)

    # Check for errors
    if isinstance(result, dict) and "error" in result:
        return redirect(url_for('render_segmentManagement', error=result["error"]))

    # Return a success message if needed
    return redirect(url_for('render_segmentManagement', message="Promocode created successfully!"))


if __name__ == '__main__':
    app.run(debug=True)
