document.addEventListener('DOMContentLoaded', function() {
    
    // Récupère les éléments de départ et d'arrivée 
    const startInput = document.getElementById('start-location');
    const endInput = document.getElementById('end-location');

    startInput.addEventListener('input', function() {
        fetchAddressSuggestions(startInput);
    });

    endInput.addEventListener('input', function() {
        fetchAddressSuggestions(endInput);
    });

    

    function fetchAddressSuggestions(inputElement) {
        const query = inputElement.value;
        if (query.length < 3) {
            return;
        }

        fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                const suggestions = data.features.map(feature => feature.properties.label);

                showSuggestions(inputElement, suggestions);
            })
            .catch(error => console.error('Error fetching address suggestions:', error));
    }

    function showSuggestions(inputElement, suggestions) {
        // Supprimez les anciennes suggestions
        let suggestionBox = inputElement.nextElementSibling;
        if (suggestionBox) {
            suggestionBox.remove();
        }

        // Crée une nouvelle boîte de suggestions
        suggestionBox = document.createElement('ul');
        suggestionBox.classList.add('suggestion-box');

        suggestions.forEach(suggestion => {
            const item = document.createElement('li');
            item.textContent = suggestion;
            item.addEventListener('click', function() {
                inputElement.value = suggestion;
                suggestionBox.remove();
            });
            suggestionBox.appendChild(item);
        });

        inputElement.parentNode.appendChild(suggestionBox);
    }


    // Itinéraire
    const mapElement = document.getElementById('map');
    
    if (mapElement) {
        const map = L.map(mapElement).setView([46.67800, 8.37900], 7);

        // Utilisation de la carte MapTiler
        L.tileLayer('https://api.maptiler.com/maps/ch-swisstopo-lbm-dark/{z}/{x}/{y}.png?key=UsTkArdJgWSIZOEqSvTe', {
            attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>',
            maxZoom: 18
        }).addTo(map);

        const interestsIcon = L.icon({
            iconUrl: './icons/icons8-point-30.png',
            iconSize: [34, 34], 
            iconAnchor: [22, 34], 
            popupAnchor: [-6, -30],  
        });

        points.forEach(function(point) {
            const marker = L.marker([point.lat, point.long], { icon: interestsIcon }).addTo(map);
            marker.bindPopup(`<strong>${point.name}</strong><br>${point.address}, ${point.cp} ${point.city}, ${point.country}`);
            
        });

        const control = L.Routing.control({
            waypoints: [],
            routeWhileDragging: true
        }).addTo(map);

        // Masquer le panneau d'information au début
        const routeInfo = document.querySelector('.leaflet-routing-container');
        if (routeInfo) {
            routeInfo.style.display = 'none';
        }

        function updateRoute() {
            const start = startInput.value;
            const end = endInput.value;

            if (start && end) {
                fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(start)}`)
                    .then(response => response.json())
                    .then(data => {
                        const startLatLng = L.latLng(
                            data.features[0].geometry.coordinates[1],
                            data.features[0].geometry.coordinates[0]
                        );
                        return fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(end)}`)
                            .then(response => response.json())
                            .then(data => {
                                const endLatLng = L.latLng(
                                    data.features[0].geometry.coordinates[1],
                                    data.features[0].geometry.coordinates[0]
                                );
                                control.setWaypoints([startLatLng, endLatLng]);

                                // Rendre le panneau d'information visible lorsque les deux points sont définis
                                if (routeInfo) {
                                    routeInfo.style.display = 'block';
                                }
                            });
                    });
            } else {
                // Masquer le panneau d'information si un des points n'est pas défini
                if (routeInfo) {
                    routeInfo.style.display = 'none';
                }

                control.setWaypoints([]);
            }
        }

        startInput.addEventListener('change', updateRoute);
        endInput.addEventListener('change', updateRoute);
    }
});