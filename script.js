const RADIO_API = "https://de2.api.radio-browser.info/json"
let searchType = document.getElementById("search_by").value;
let searchQuery = document.getElementById("search_query").value;
const stationsList = document.querySelector(".stations");
const searchBtn = document.querySelector(".search_btn");
const limit = 100;

// Search Radio Stations in a List
var url = ``;

async function searchStations(searchType) {
    console.log("Search request sent with type: ", searchType);
    const response = await fetch(url);
    if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        stationsList.innerHTML = `<p class="error">Error 404: The station can not be found!</p>`;
        return;
    }
    const data = await response.json();
    if (data.length === 0) {
        stationsList.innerHTML = `<p class="error">No stations found for "${searchQuery}"</p>`;
        return;
    }
    displayStations(data);    
}

// Display Stations in a List
function displayStations(data) {
    stationsList.innerHTML = ""; // Clear previous results    
    data.forEach((station, index) => {
        const stationItem = document.createElement("div");
        stationItem.classList.add("station");
        const limitedName = station.name.length > 30 ? station.name.slice(0, 30) + "..." : station.name;
        stationItem.innerHTML = `
            <p class="channel_number">${index + 1}</p>
            <img src="${station.favicon}" alt="${limitedName}" class="favicon" onerror="this.onerror=null; this.src='https://via.placeholder.com/150';">
            <h3>${limitedName}</h3>
            <p class="country">Country: ${station.country}</p>                
            <p class="language">Language: ${station.language}</p>
            <div class="audio-player">
                <button class="play-btn" onclick="playStream('${station.url_resolved}', this)">▶</button>
                <volume-control>
                    <label for="volume-${index}">Vol:</label>
                    <input type="range" id="volume-${index}" name="volume" min="0" max="1" step="0.01" value="0.5">
                </volume-control>
            </div>
        `;
        stationsList.appendChild(stationItem);
    });

    document.querySelector(".error").style.display = "none"; // Hide error message if data is found        
}

searchBtn.addEventListener("click", () => {
    searchType = document.getElementById("search_by").value;
    searchQuery = document.getElementById("search_query").value.trim();
    if (searchQuery === "") {
        stationsList.innerHTML = `<p class="error">Please enter a search query.</p>`;
        return;
    }
    url = `${RADIO_API}/stations/by${searchType}/${searchQuery}?limit=${limit}`;
    searchStations(searchType);
});

// Play/pause Stream
let currentAudio = null;
function playStream(streamUrl, btn) {
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        let allPlayButtons = document.querySelectorAll(".play-btn");
        allPlayButtons.forEach(button => {
            button.textContent = "▶"; // Reset other buttons
        });
        if (currentAudio.src === streamUrl) {
            currentAudio = null; // Stop if the same station is clicked
            btn.textContent = "▶";
            return;
        }
    }
    currentAudio = new Audio(streamUrl);
    currentAudio.crossOrigin = "anonymous"; // Handle CORS issues
    currentAudio.volume = 0.5; // Default volume
    currentAudio.play().catch(error => {
        console.error("Error playing stream:", error);
        alert("Error playing stream. Please try another station.");
    });
    btn.textContent = "⏸"; // Change button to pause icon   

    currentAudio.onended = () => {
        if (btn) btn.textContent = "▶"; // Change button back to play icon
    };

    // Volume Control
    const volumeControl = btn.nextElementSibling.querySelector("input");
    volumeControl.value = currentAudio.volume;
    volumeControl.oninput = function() {
        if (currentAudio) {
            currentAudio.volume = this.value;
        }
    };
}