document.addEventListener('DOMContentLoaded', function () {
    // Retrieve data from sessionStorage
    const uploadResponse = JSON.parse(sessionStorage.getItem('uploadResponse'));

    if (uploadResponse) {
        // Process the data as needed
        const messageElement = document.getElementById('results-message');
        const rowCountElement = document.getElementById('row-count');
        const conflictCasesElement = document.getElementById('conflict-cases');

        // Set the message and apply class based on the message content
        messageElement.textContent = uploadResponse.message;
        if (uploadResponse.message === "File parsed successfully") {
            messageElement.classList.add('success');
        } else {
            messageElement.classList.add('error');
        }

        // Display the row count
        rowCountElement.innerHTML = `
            <div>Uploaded Clients: ${uploadResponse.number_clean_cases}</div>
            <div>Conflict Cases: ${uploadResponse.number_conflict_cases}</div>
        `;

        // Display the conflict cases
        if (uploadResponse.conflict_cases && uploadResponse.conflict_cases.length > 0) {
            uploadResponse.conflict_cases.forEach(conflict => {
                const conflictDiv = document.createElement('div');
                conflictDiv.className = 'conflict-case';

                const conflictTypeText = conflict.conflict_type === "client_already_in_promo"
                    ? "Client already has a promotion"
                    : conflict.conflict_type;

                conflictDiv.innerHTML = `
                    <strong>Conflict Type:</strong> ${conflictTypeText}
                    <div class="details">
                        <div><strong>RCIF:</strong> ${conflict.details.RCIF}</div>
                        <div><strong>CCIF:</strong> ${conflict.details.CCIF}</div>
                        <div><strong>Promocode:</strong> ${conflict.details.promocode}</div>
                    </div>
                `;
                conflictCasesElement.appendChild(conflictDiv);
            });
        }

        // Optionally, clear the data from sessionStorage
        sessionStorage.removeItem('uploadResponse');
    } else {
        // Handle cases where there's no data in sessionStorage
        console.log('No data available in sessionStorage');
    }
});

