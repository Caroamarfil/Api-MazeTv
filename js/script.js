let currentPage = 1; //Guarda el número de la página actual (en la que está el usuario)
let isSearching = false; //Variable para identificar si se activa el modo búsqueda
let allSeries = []; //Array que almacena todos los datos de las series para poder buscar en todas las páginas a la vez
let savedPage = null; // Guarda la página en la que estaba el usuario antes de la búsqueda para poder volver a ella

// Función para obtener el listado de series de TV
async function fetchSeries(page = 1, searchQuery = '') {
    const url = `https://api.tvmaze.com/shows?page=${page}`; //Construye la URL usando el número de página recibido como parámetro.
    clearMessage();
    //Este try revisa si aún no se han cargado datos en el array, si está vacío hace un fetch para obtener todos los datos y los guarda
    try {
        if (allSeries.length === 0) { 
            const response = await fetch(url);
            const data = await response.json();
            allSeries = data;
        }
        //Revisa si el campo de búsqueda está vacío, si no lo esta, filtra los datos. Si está vacío, muestra todos los datos.
        const filteredData = searchQuery
            ? allSeries.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            : allSeries;
        const cardContainer = document.getElementById('card-container');
        cardContainer.innerHTML = ''; // Limpia las tarjetas antes de mostrar los nuevos resultados 

        // Si no hay resultados, muestra un mensaje de error. Si hay resultados, muestra los datos filtrados y los botones de paginación
        if (filteredData.length > 0) {
            displayData(filteredData.slice((currentPage - 1) * 12, currentPage * 12), 'series');
            updateButtons(!isSearching);
        } else if (searchQuery) {
            displayMessage(`No se encontraron resultados para "${searchQuery}".`);
            updateButtons(false); // Desactiva botones si no hay resultados
        } else {
            displayData(filteredData, 'series');
            updateButtons(true);
        }
    } catch (error) {
        console.error('Error al obtener las series:', error);
        displayMessage('Error al cargar los datos. Intente nuevamente.');
    }
}

// Crea el contenedor para mostrar los datos en las tarjetas
function displayData(data) {
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = '';

    data.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');

        const imageUrl = item.image ? item.image.medium : 'https://via.placeholder.com/150';
        const premiered = item.premiered ? new Date(item.premiered).getFullYear() : 'No disponible';

        card.innerHTML = `
            <img src="${imageUrl}" alt="${item.name}" />
            <h2><strong>Título:</strong> ${item.name}</h2>
            <p><strong>Género:</strong> ${item.genres.join(', ') || 'No disponible'}</p>
            <p><strong>Estreno:</strong> ${premiered}</p>
            <p><strong>Idioma:</strong> ${item.language}</p>
        `;
        cardContainer.appendChild(card);
    });
}

// Controla la visibilidad de los botones de paginación y de volver a navegación
function updateButtons(showPagination) {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const backButton = document.getElementById('back-button');

    // Mostrar/ocultar botones de paginación y "Volver a la navegación"
    prevButton.style.display = showPagination ? 'inline-block' : 'none';
    nextButton.style.display = showPagination ? 'inline-block' : 'none';
    backButton.style.display = showPagination ? 'none' : 'inline-block';
}

// Mostrar mensaje de error
function displayMessage(message) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerText = message;
    messageContainer.style.display = 'block';
}

// Limpiar el mensaje de error
function clearMessage() {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerText = '';
    messageContainer.style.display = 'none';
}

// Eventos para paginación y navegación
document.getElementById('next-page').addEventListener('click', () => {
    if (!isSearching) {
        currentPage++;
    }
    fetchSeries(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
    }
    fetchSeries(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById('home-button').addEventListener('click', () => {
    currentPage = 1;
    isSearching = false;
    document.getElementById('search-input').value = '';
    fetchSeries(currentPage);
});

document.getElementById('back-button').addEventListener('click', () => {
    isSearching = false;
    currentPage = savedPage || 1;
    clearMessage(); 
    fetchSeries(currentPage);
    updateButtons(true);
});

// Si searchSeries no está vacío se activa el modo de búsqueda, se guarda la curret page en savedpage para poder volver a ella.
async function searchSeries() {
    const searchQuery = document.getElementById('search-input').value.trim();

    if (searchQuery) {
        isSearching = true;
        savedPage = currentPage;
        currentPage = 1;
        clearMessage(); 
        await fetchSeries(currentPage, searchQuery);
        updateButtons(false); // Oculta paginación y muestra "Volver a la navegación"

        // Limpiar el campo de búsqueda
        document.getElementById('search-input').value = '';
    }
}

document.getElementById('search-button').addEventListener('click', searchSeries);
//Evento de carga inicial, para mostrar la primera página apenas se abre la app
fetchSeries(currentPage);
