document.addEventListener("DOMContentLoaded", function() {
    const navLinks = document.querySelectorAll("nav ul li a");

    navLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();

            if (link.textContent.trim() === "Promocodes management") {
                window.location.href = "/segment-management";
            } else if (link.textContent.trim() === "Client management") {
                window.location.href = "/client-management";
            } else if (link.textContent.trim() === "Overview dashboard") {
                window.location.href = "/overview-dashboard";
            }
        });
    });
});
