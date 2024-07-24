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
        "AED.*": "AED against any currency",
        "*.AED": "Any currency against AED",
        "USD.AED": "US Dollar against AED",
        "EUR.*": "Euro against any currency",
        "*.EUR": "Any currency against Euro",
        "EUR.USD": "Euro against US Dollar",
        "EUR.GBP": "Euro against Great Britain pound",
        "GBP.*": "Great Britain pound against any currency",
        "*.GBP": "Any currency against Great Britain pound",
        "GBP.AED": "Great Britain pound against AED",
        "GBP.USD": "Great Britain pound against US Dollar",
        "INR.*": "Indian rupee against any currency",
        "*.INR": "Any currency against Indian rupee",
        "INR.AED": "Indian rupee against AED",
        "EUR.INR": "Euro against Indian rupee",
        "USD.INR": "US Dollar against Indian rupee",
        "GBP.INR": "Great Britain pound against Indian rupee",
        "INR.1": "Indian rupee against AED",
        "EUR.2": "Euro against Indian rupee",
        "USD.3": "US Dollar against Indian rupee",
        "GBP.4": "Great Britain pound against Indian rupee",
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
