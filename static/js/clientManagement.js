// Upload button is clicked
document.addEventListener('DOMContentLoaded', (event) => {
    const uploadButton = document.getElementById('clients-upload-btn');
    if (uploadButton) {
        uploadButton.addEventListener('click', () => {
            window.location.href = "/client-management/client-upload-stages";
        });
    }
});

document.getElementById('search-clients-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting the default way
    const searchResults = document.querySelector('.clients-search tbody');

    const query = document.getElementById('rcif-client-search').value; // Get the value of the input
    const endpoint = query ? `/client?uniqueID=${encodeURIComponent(query)}` : '/client'; // Construct the endpoint URL


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
                data.forEach((client, index) => {
                    // Helper function to render table cell content
                    const renderCell = (value) => value == null ? '' : value;
                    const renderNumTrnxCell = (value) => value == null ? 0 : value
                    const row = document.createElement('tr');

                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${renderCell(client.rcif)}</td>
                        <td>${renderCell(client.ccif)}</td>
                        <td>${renderCell(client.uniqueID)}</td>
                        <td>${renderCell(client.promocode)}</td>
                        <td>${renderCell(client.uploaded_on)}</td>
                        <td>${renderCell(client.creator)}</td>
                        <td>${renderNumTrnxCell(client.trx_executed)}</td>
                    `;
                    searchResults.appendChild(row);
                });
            }
        })
        .catch(error => {
            // Extract error message from the error object if possible
            let errorMessage = 'An error occurred while searching. Please try again later.';
            if (error && error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;  // Extracting specific error message from API response
            } else if (error.message) {
                errorMessage = error.message;  // Extracting general error message
            }

            // Display the error message in the table
            searchResults.innerHTML = `<tr><td colspan="9">${errorMessage}</td></tr>`;
        });
});