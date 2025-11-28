const API_KEY = "36bce817";  // Your OMDb API Key

document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.getElementById("search-input");
    
    searchBtn.addEventListener("click", searchMovies);
    searchInput.addEventListener("keypress", function(e) {
        if (e.key === 'Enter') {
            searchMovies();
        }
    });
});

function searchMovies() {
    let movieTitle = document.getElementById("search-input").value.trim();
    
    if (!movieTitle) {
        alert("Please enter a movie title");
        return;
    }

    showLoading(true);

    fetch(`/recommend?title=${encodeURIComponent(movieTitle)}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Network error'); });
            }
            return response.json();
        })
        .then(data => {
            if (data.recommended) {
                displayRecommendations(data.recommended);
            } else {
                throw new Error(data.error || 'No recommendations found');
            }
        })
        .catch(error => {
            console.error("Error:", error);
            displayError(error.message);
        })
        .finally(() => {
            showLoading(false);
        });
}

function displayRecommendations(recommendations) {
    let resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    // Create recommendation grid
    recommendations.forEach(movie => {
        fetchMoviePoster(movie.title, resultsDiv);
    });
}

function fetchMoviePoster(movieTitle, container) {
    fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${API_KEY}`)
        .then(response => response.json())
        .then(movieData => {
            if (movieData.Response === "True") {
                createMovieCard(movieData, container);
            } else {
                createMovieCard({
                    Title: movieTitle,
                    Poster: "https://via.placeholder.com/150x225/333333/FFFFFF?text=No+Image",
                    Year: "N/A"
                }, container);
            }
        })
        .catch(error => {
            console.error("Error fetching movie details:", error);
            createMovieCard({
                Title: movieTitle,
                Poster: "https://via.placeholder.com/150x225/333333/FFFFFF?text=Error",
                Year: "N/A"
            }, container);
        });
}

function createMovieCard(movieData, container) {
    let movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");
    
    let poster = movieData.Poster && movieData.Poster !== "N/A" 
        ? movieData.Poster 
        : "https://via.placeholder.com/150x225/333333/FFFFFF?text=No+Image";

    movieCard.innerHTML = `
        <div class="poster-container">
            <img src="${poster}" alt="${movieData.Title}" onerror="this.src='https://via.placeholder.com/150x225/333333/FFFFFF?text=Image+Error'">
            <div class="movie-overlay">
                <button class="watch-btn">▶ Watch</button>
            </div>
        </div>
        <div class="movie-info">
            <div class="movie-title">${movieData.Title}</div>
            <div class="movie-year">${movieData.Year}</div>
        </div>
    `;
    
    container.appendChild(movieCard);
}

function displayError(message) {
    let resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
        <div class="error-message">
            <p>❌ ${message}</p>
            <p>Please try another movie title.</p>
        </div>
    `;
}

function showLoading(show) {
    let resultsDiv = document.getElementById("results");
    if (show) {
        resultsDiv.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Finding your next favorite movie...</p>
            </div>
        `;
    }
}