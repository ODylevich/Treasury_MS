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


// Download excel button
document.addEventListener("DOMContentLoaded", function() {
    const downloadBtn = document.getElementById("download-btn");
    const dataTable = document.getElementById("clients-data-table");
    const searchResults = dataTable.querySelector("tbody");

    function updateDownloadButtonState() {
        // Check if table has data rows
        const rows = searchResults.querySelectorAll("tr");
        const noResultsFound = rows.length === 1 && (rows[0].textContent.includes("No results found.") || rows[0].textContent.includes("An error occurred while searching."));
        if (rows.length > 0 && !noResultsFound) {
            downloadBtn.disabled = false; // Enable button if there are data rows
        } else {
            downloadBtn.disabled = true; // Disable button if no data rows or if there are messages
        }
    }

    function downloadTableAsExcel() {
        const wb = XLSX.utils.table_to_book(dataTable, { sheet: "Sheet1" });
        XLSX.writeFile(wb, "clients_table_data.xlsx");
    }

    // Event listener for the download button
    downloadBtn.addEventListener("click", downloadTableAsExcel);

    // Initial call to set the button state
    updateDownloadButtonState();

        // Use MutationObserver to watch for changes in the table's tbody
    const observer = new MutationObserver(updateDownloadButtonState);
    observer.observe(dataTable.querySelector('tbody'), {
        childList: true, // Watch for additions or removals of child elements
    });

});