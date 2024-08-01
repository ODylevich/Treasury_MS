document.addEventListener('DOMContentLoaded', function() {
    // Get the modal
    const modal = document.getElementById("promocode-selection-modal");

    // Get the button that opens the modal
    const btn = document.getElementById("select-promocode");

    // Get the <span> element that closes the modal
    const span = document.getElementsByClassName("close")[0];

    // Get the select button inside the modal
    const selectBtn = document.getElementById("select-promocode-btn");

    // Get the search input and promocode list
    const searchInput = document.getElementById("search-promocode");
    const promocodeList = document.getElementById("promocode-list");

    // Label that displays the selected promocode
    const selectedPromocodeLabel = document.getElementById('selected-promocode');
    let selectedPromocodeName = '';

    // Open the modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // Close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Close the modal when the select button is clicked and update the label
    selectBtn.onclick = function() {
        if (selectedPromocodeName) {
            selectedPromocodeLabel.textContent = selectedPromocodeName; // Update the label with the selected promocode
        } else {
            selectedPromocodeLabel.textContent = 'Empty'; // Default message if none selected
        }
        modal.style.display = "none"; // Close the modal
    };

    // Close the modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Function to handle search input filtering
    searchInput.addEventListener('input', function() {
        const filter = searchInput.value.toLowerCase();
        const promocodeItems = document.querySelectorAll('#promocode-list li'); // Get list items directly

        promocodeItems.forEach(function(item) {
            const text = item.textContent.toLowerCase();
            if (text.includes(filter)) {
                item.style.display = ''; // Show item
            } else {
                item.style.display = 'none'; // Hide item
            }
        });
    });

    // Fetch and populate promocodes when the document is loaded
    fetchPromocodes();

    function fetchPromocodes() {
        fetch('/promocode')
            .then(response => response.json())
            .then(data => {
                populatePromocodeList(data);
            })
            .catch(error => console.error('Error fetching promocodes:', error));
    }

    function populatePromocodeList(promocodes) {
        const promocodeList = document.getElementById('promocode-list');
        promocodeList.innerHTML = ''; // Clear existing list

        promocodes.forEach(promocode => {
            // Only display the promocode if its status is "Active"
            if (promocode.status === "Active") {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <input type="radio" name="promocode" id="promocode-${promocode.id}" value="${promocode.id}">
                    <label for="promocode-${promocode.id}">${promocode.name}</label>
                `;
                listItem.addEventListener('click', function() {
                    selectedPromocodeName = promocode.name; // Update selected promocode name
                });
                promocodeList.appendChild(listItem);
            }
        });
    }
});

// file upload functionality
let formData;

document.addEventListener('DOMContentLoaded', function() {
    const uploadButton = document.getElementById('upload-clients-file');
    const fileInput = document.getElementById('file-input');
    const selectedFileLabel = document.getElementById('selected-file');

    uploadButton.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                selectedFileLabel.textContent = 'Empty';
                document.getElementById('warning-label').textContent = 'Please upload an Excel file.';
                document.getElementById('warning-label').style.display = 'block';
                return;
            }
            selectedFileLabel.textContent = file.name;
            formData = new FormData();
            formData.append('client_upload_file', file);
        } else {
            selectedFileLabel.textContent = 'Empty';
        }
    });
});

document.getElementById('review-client-upload').addEventListener('click', function() {
    const selectedFile = document.getElementById('selected-file').textContent;
    const selectedPromocode = document.getElementById('selected-promocode').textContent;

    if (selectedFile === "Empty" || selectedPromocode === "Empty") {
        document.getElementById('warning-label').style.display = 'block';
    } else {
        document.getElementById('warning-label').style.display = 'none';

        if (formData) {
            formData.append('selected_promocode', selectedPromocode);
            fetch('/client', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                 if (!response.ok) {  // Catching all 400 and 500 responses
                    return response.json().then(errorData => {
                        throw new Error('Network response was not ok ' + response.statusText + ': ' + errorData.error);
                    });
                }
                return response.json();
            })
            .then(data => {
                // Store data in sessionStorage
                sessionStorage.setItem('uploadResponse', JSON.stringify(data));
                // Redirect to /client-upload-results
                window.location.href = '/client-management/client-upload-results';
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('warning-label').textContent = error || 'An unexpected error occurred.';
                document.getElementById('warning-label').style.display = 'block';
});
        } else {
            console.error('No file selected.');
        }
    }
});