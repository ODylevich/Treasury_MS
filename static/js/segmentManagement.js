document.getElementById('create-segment-form').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission

    const formData = new FormData(event.target);
    const data = {};

    formData.forEach((value, key) => {
        if (key === 'max-trades') {
            data[key] = parseInt(value, 10);  // Convert to integer
        } else if (key === 'valid-till') {
            if (value) {
                const validTillDate = new Date(value);
                data[key] = validTillDate.toISOString().split('T')[0]; // Send as ISO string if provided
            } else {
                data[key] = null; // Handle optional field
            }
        } else {
            data[key] = value;
        }
    });

    // Validate the currency pairs field
    const ccyPairsValue = document.getElementById('valid-ccy-pairs').value;
    const ccyPairsMessage = document.getElementById('ccy-pairs-message');

    if (!ccyPairsValue.trim()) {
        ccyPairsMessage.style.display = 'inline'; // Show the inline message
        return; // Prevent form submission
    } else {
        ccyPairsMessage.style.display = 'none'; // Hide the inline message
    }

    fetch('/create_promo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            // Redirect to segment management page with error message
            window.location.href = `/segment-management?error=${encodeURIComponent(data.error)}`;
        } else {
            // Redirect to segment management page with success message
            window.location.href = `/segment-management?message=${encodeURIComponent(data.message)}`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('valid-till');
    const message = document.getElementById('date-message');

    dateInput.addEventListener('change', function() {
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set hours to 00:00:00 to compare dates only
        selectedDate.setHours(0, 0, 0, 0); // Also set hours to 00:00:00 for comparison

        if (selectedDate <= today) {
            message.textContent = "The date should be in the future";
            message.style.display = 'block';
            dateInput.value = ''; // Clear the invalid date
        } else {
            message.style.display = 'none';
        }
    });

    // Clear button functionality
    document.getElementById('clear-date').addEventListener('click', function() {
        dateInput.value = '';
        message.style.display = 'none';
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var modal = document.getElementById("ccy-pairs-modal");
    var link = document.getElementById("add-ccy-pairs-link");
    var span = document.getElementsByClassName("close")[0];
    var submitButton = document.getElementById("ccy-pairs-submit");
    var ccyPairsInput = document.getElementById("valid-ccy-pairs");
    var selectedPairsContainer = document.querySelector('.selected-pairs');
    var currencyPairsContainer = document.getElementById('currency-pairs-container');
    var searchInput = document.getElementById("search-pairs");

    var currencyPairs = {
        "*.*": "Any currency against any currency",
        "AUD.AED": "Australian Dollar against AED",
        "AUD.CAD": "Australian Dollar against Canadian Dollar",
        "AUD.CHF": "Australian Dollar against Swiss Franc",
        "AUD.JPY": "Australian Dollar against Japanese Yen",
        "AUD.SGD": "Australian Dollar against Singapore Dollar",
        "AUD.USD": "Australian Dollar against US Dollar",
        "BDT.AED": "Bangladeshi Taka against AED",
        "BHD.AED": "Bahraini Dinar against AED",
        "BOB.AED": "Bolivian Boliviano against AED",
        "CAD.AED": "Canadian Dollar against AED",
        "CHF.AED": "Swiss Franc against AED",
        "CNY.AED": "Chinese Yuan against AED",
        "EGP.AED": "Egyptian Pound against AED",
        "EUR.AED": "Euro against AED",
        "EUR.AUD": "Euro against Australian Dollar",
        "EUR.CAD": "Euro against Canadian Dollar",
        "EUR.CHF": "Euro against Swiss Franc",
        "EUR.GBP": "Euro against British Pound",
        "EUR.INR": "Euro against Indian Rupee",
        "EUR.JPY": "Euro against Japanese Yen",
        "EUR.OMR": "Euro against Omani Rial",
        "EUR.QAR": "Euro against Qatari Riyal",
        "EUR.SAR": "Euro against Saudi Riyal",
        "EUR.SGD": "Euro against Singapore Dollar",
        "EUR.USD": "Euro against US Dollar",
        "GBP.AED": "British Pound against AED",
        "GBP.AUD": "British Pound against Australian Dollar",
        "GBP.CAD": "British Pound against Canadian Dollar",
        "GBP.CHF": "British Pound against Swiss Franc",
        "GBP.INR": "British Pound against Indian Rupee",
        "GBP.JPY": "British Pound against Japanese Yen",
        "GBP.OMR": "British Pound against Omani Rial",
        "GBP.SAR": "British Pound against Saudi Riyal",
        "GBP.SGD": "British Pound against Singapore Dollar",
        "GBP.USD": "British Pound against US Dollar",
        "GBP.ZAR": "British Pound against South African Rand",
        "HKD.AED": "Hong Kong Dollar against AED",
        "INR.AED": "Indian Rupee against AED",
        "JPY.AED": "Japanese Yen against AED",
        "KWD.AED": "Kuwaiti Dinar against AED",
        "LKR.AED": "Sri Lankan Rupee against AED",
        "NGN.AED": "Nigerian Naira against AED",
        "NOK.AED": "Norwegian Krone against AED",
        "NPR.AED": "Nepalese Rupee against AED",
        "OMR.AED": "Omani Rial against AED",
        "PHP.AED": "Philippine Peso against AED",
        "PKR.AED": "Pakistani Rupee against AED",
        "QAR.AED": "Qatari Riyal against AED",
        "SAR.AED": "Saudi Riyal against AED",
        "SGD.AED": "Singapore Dollar against AED",
        "TRY.AED": "Turkish Lira against AED",
        "USD.AED": "US Dollar against AED",
        "USD.ARS": "US Dollar against Argentine Peso",
        "USD.BDT": "US Dollar against Bangladeshi Taka",
        "USD.BHD": "US Dollar against Bahraini Dinar",
        "USD.BOB": "US Dollar against Bolivian Boliviano",
        "USD.CAD": "US Dollar against Canadian Dollar",
        "USD.CHF": "US Dollar against Swiss Franc",
        "USD.CNH": "US Dollar against Chinese Yuan (Offshore)",
        "USD.CNY": "US Dollar against Chinese Yuan",
        "USD.DKK": "US Dollar against Danish Krone",
        "USD.EGO": "US Dollar against EGO",
        "USD.EGP": "US Dollar against Egyptian Pound",
        "USD.GHO": "US Dollar against GHO",
        "USD.GHS": "US Dollar against Ghanaian Cedi",
        "USD.GNF": "US Dollar against Guinean Franc",
        "USD.GNO": "US Dollar against GNO",
        "USD.HKD": "US Dollar against Hong Kong Dollar",
        "USD.INO": "US Dollar against INO",
        "USD.INR": "US Dollar against Indian Rupee",
        "USD.JOD": "US Dollar against JOD",
        "USD.JPY": "US Dollar against Japanese Yen",
        "USD.KES": "US Dollar against Kenyan Shilling",
        "USD.KRO": "US Dollar against Korean Won (Old)",
        "USD.KRW": "US Dollar against South Korean Won",
        "USD.KWD": "US Dollar against Kuwaiti Dinar",
        "USD.LKR": "US Dollar against Sri Lankan Rupee",
        "USD.MYO": "US Dollar against Malaysian Ringgit (Old)",
        "USD.MYR": "US Dollar against Malaysian Ringgit",
        "USD.NAD": "US Dollar against Namibian Dollar",
        "USD.NGN": "US Dollar against Nigerian Naira",
        "USD.NGO": "US Dollar against Nigerian Naira (Old)",
        "USD.NOK": "US Dollar against Norwegian Krone",
        "USD.NPR": "US Dollar against Nepalese Rupee",
        "USD.OMR": "US Dollar against Omani Rial",
        "USD.PHO": "US Dollar against PHO",
        "USD.PHP": "US Dollar against Philippine Peso",
        "USD.PKR": "US Dollar against Pakistani Rupee",
        "USD.QAR": "US Dollar against Qatari Riyal",
        "USD.RUB": "US Dollar against Russian Ruble",
        "USD.SAR": "US Dollar against Saudi Riyal",
        "USD.SEK": "US Dollar against Swedish Krona",
        "USD.SGD": "US Dollar against Singapore Dollar",
        "USD.TRY": "US Dollar against Turkish Lira",
        "USD.TWD": "US Dollar against Taiwan Dollar",
        "USD.TWO": "US Dollar against TWO",
        "USD.TZS": "US Dollar against Tanzanian Shilling",
        "USD.UGX": "US Dollar against Ugandan Shilling",
        "USD.ZAR": "US Dollar against South African Rand",
        "XAG.AED": "Silver against AED",
        "XAG.USD": "Silver against US Dollar",
        "XAU.AED": "Gold against AED",
        "XAU.USD": "Gold against US Dollar",
        "XPD.AED": "Palladium against AED",
        "XPD.USD": "Palladium against US Dollar",
        "XPT.AED": "Platinum against AED",
        "XPT.USD": "Platinum against US Dollar",
        "ZAR.AED": "South African Rand against AED",
        "USD.*": "US Dollar against any currency",
        "*.USD": "Any currency against US Dollar",
        "AUD.*": "Australian Dollar against any currency",
        "*.AUD": "Any currency against Australian Dollar",
        "BDT.*": "Bangladeshi Taka against any currency",
        "*.BDT": "Any currency against Bangladeshi Taka",
        "BHD.*": "Bahraini Dinar against any currency",
        "*.BHD": "Any currency against Bahraini Dinar",
        "BOB.*": "Bolivian Boliviano against any currency",
        "*.BOB": "Any currency against Bolivian Boliviano",
        "CAD.*": "Canadian Dollar against any currency",
        "*.CAD": "Any currency against Canadian Dollar",
        "CHF.*": "Swiss Franc against any currency",
        "*.CHF": "Any currency against Swiss Franc",
        "CNY.*": "Chinese Yuan against any currency",
        "*.CNY": "Any currency against Chinese Yuan",
        "EGP.*": "Egyptian Pound against any currency",
        "*.EGP": "Any currency against Egyptian Pound",
        "EUR.*": "Euro against any currency",
        "*.EUR": "Any currency against Euro",
        "GBP.*": "British Pound against any currency",
        "*.GBP": "Any currency against British Pound",
        "HKD.*": "Hong Kong Dollar against any currency",
        "*.HKD": "Any currency against Hong Kong Dollar",
        "INR.*": "Indian Rupee against any currency",
        "*.INR": "Any currency against Indian Rupee",
        "JPY.*": "Japanese Yen against any currency",
        "*.JPY": "Any currency against Japanese Yen",
        "KWD.*": "Kuwaiti Dinar against any currency",
        "*.KWD": "Any currency against Kuwaiti Dinar",
        "LKR.*": "Sri Lankan Rupee against any currency",
        "*.LKR": "Any currency against Sri Lankan Rupee",
        "NGN.*": "Nigerian Naira against any currency",
        "*.NGN": "Any currency against Nigerian Naira",
        "NOK.*": "Norwegian Krone against any currency",
        "*.NOK": "Any currency against Norwegian Krone",
        "NPR.*": "Nepalese Rupee against any currency",
        "*.NPR": "Any currency against Nepalese Rupee",
        "OMR.*": "Omani Rial against any currency",
        "*.OMR": "Any currency against Omani Rial",
        "PHP.*": "Philippine Peso against any currency",
        "*.PHP": "Any currency against Philippine Peso",
        "PKR.*": "Pakistani Rupee against any currency",
        "*.PKR": "Any currency against Pakistani Rupee",
        "QAR.*": "Qatari Riyal against any currency",
        "*.QAR": "Any currency against Qatari Riyal",
        "SAR.*": "Saudi Riyal against any currency",
        "*.SAR": "Any currency against Saudi Riyal",
        "SGD.*": "Singapore Dollar against any currency",
        "*.SGD": "Any currency against Singapore Dollar",
        "TRY.*": "Turkish Lira against any currency",
        "*.TRY": "Any currency against Turkish Lira",
        "XAG.*": "Silver against any currency",
        "*.XAG": "Any currency against Silver",
        "XAU.*": "Gold against any currency",
        "*.XAU": "Any currency against Gold",
        "XPD.*": "Palladium against any currency",
        "*.XPD": "Any currency against Palladium",
        "XPT.*": "Platinum against any currency",
        "*.XPT": "Any currency against Platinum",
        "ZAR.*": "South African Rand against any currency",
        "*.ZAR": "Any currency against South African Rand"
    };

    function generateCurrencyPairsHtml() {
        return Object.keys(currencyPairs).map(function(key) {
            return `
                <div class="currency-pair">
                    <input type="checkbox" name="ccy-pair" value="${key}">
                    <label>${key}</label>
                    <label>${currencyPairs[key]}</label>
                </div>
            `;
        }).join('');
    }

    // Populate the currency pairs container
    currencyPairsContainer.innerHTML = generateCurrencyPairsHtml();

    // Open the modal
    link.onclick = function(event) {
        event.preventDefault();
        modal.style.display = "block";
        document.body.classList.add('modal-open'); // Disable background scrolling
    }

    // Close the modal
    span.onclick = function() {
        modal.style.display = "none";
        document.body.classList.remove('modal-open'); // Enable background scrolling
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            document.body.classList.remove('modal-open'); // Enable background scrolling
        }
    }

    // Add event listener to submit button
    submitButton.onclick = function() {
        var selectedPairs = [];
        document.querySelectorAll('input[name="ccy-pair"]:checked').forEach(function(checkbox) {
            selectedPairs.push(checkbox.value);
        });
        ccyPairsInput.value = selectedPairs.join(', ');
        modal.style.display = "none";
        document.body.classList.remove('modal-open'); // Enable background scrolling
    }

    // Update selected pairs section
    document.querySelectorAll('input[name="ccy-pair"]').forEach(function(checkbox) {
        checkbox.addEventListener('change', function() {
            updateSelectedPairs();
        });
    });

    function updateSelectedPairs() {
        var selectedPairsHtml = '<ol>'; // Start numbered list
        document.querySelectorAll('input[name="ccy-pair"]:checked').forEach(function(checkbox) {
            selectedPairsHtml += '<li>' + checkbox.value + '</li>';
        });
        selectedPairsHtml += '</ol>'; // End numbered list
        selectedPairsContainer.innerHTML = selectedPairsHtml;
    }

    // Filter currency pairs based on search input
    searchInput.addEventListener('input', function() {
        var filter = searchInput.value.toLowerCase();
        var currencyPairs = document.querySelectorAll('#currency-pairs-container .currency-pair');

        currencyPairs.forEach(function(pair) {
            var text = pair.textContent.toLowerCase();
            if (text.includes(filter)) {
                pair.style.display = '';
            } else {
                pair.style.display = 'none';
            }
        });
    });
});


document.getElementById('search-segment-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting the default way
    console.log('Endpoint:');
    const searchResults = document.querySelector('.search-promocode tbody');

    const query = document.getElementById('search-name').value; // Get the value of the input
    const endpoint = query ? `/promocodes?query=${encodeURIComponent(query)}` : '/promocodes'; // Construct the endpoint URL


    // Perform the API call
    fetch(endpoint)
        .then(response => response.json())
        .then(data => {
            // Clear previous results
            console.log('found data', data);
            searchResults.innerHTML = '';

            if (data.length === 0) {
                searchResults.innerHTML = '<tr><td colspan="9">No results found.</td></tr>';
            } else {
                data.forEach((promocode, index) => {
                    console.log(promocode.valid_ccy_pairs);
                    console.log('Type of valid_ccy_pairs:', typeof promocode.valid_ccy_pairs);
                    // Helper function to render table cell content
                    const renderCell = (value) => value == null ? '' : value;
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${renderCell(promocode.name)}</td>
                        <td>${renderCell(promocode.creation_date)}</td>
                        <td>${renderCell(promocode.status)}</td>
                        <td>${renderCell(promocode.creator)}</td>
                        <td>${renderCell(promocode.valid_till)}</td>
                        <td>${renderCell(promocode.max_trades)}</td>
                        <td>${renderCell(promocode.valid_ccy_pairs)}</td>
                        <td>${renderCell(promocode.num_clients)}</td>
                    `;
                    searchResults.appendChild(row);
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            searchResults.innerHTML = '<tr><td colspan="9">An error occurred while searching. Please try again later.</td></tr>';
        });
});
