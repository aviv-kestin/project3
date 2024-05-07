let started = false; // Flag to track whether the application has started

// Function to start the application
function startApp() {
    if (!started) {
        // Set the opacity of the button and its container to 0
        const startButtonContainer = document.getElementById('start-button-container');
        const startButton = document.getElementById('start-button');

        // Set initial opacity to 1
        startButtonContainer.style.opacity = '1';
        startButton.style.opacity = '1';

        // Calculate the increment for opacity change over 4 seconds
        const increment = 1 / (4 * 50); // Adjust 50 to change the smoothness of the transition

        // Function to gradually reduce opacity
        function fadeOut() {
            let opacity = 1;
            const fadeInterval = setInterval(() => {
                opacity -= increment;
                startButtonContainer.style.opacity = opacity;
                startButton.style.opacity = opacity;
                if (opacity <= 0) {
                    clearInterval(fadeInterval);
                    startButtonContainer.style.display = 'none'; // Hide the button container after fading out
                }
            }, 20); // Adjust 20 to change the duration of each interval
        }

        // Call the fadeOut function after a short delay
        setTimeout(fadeOut, 100); // Adjust 100 to change the delay before starting the fade out

        // Change background color

        // Enable the search button and input field
        document.getElementById('search-button').disabled = false;
        document.getElementById('city-input').disabled = false;

        // Initialize Tone.js
        Tone.start();

        started = true;

        // Start generating rectangles after the button is clicked
        regenerateRectangles();
    }
}

// Event listener for the start button
document.getElementById('start-button').addEventListener('click', startApp);

// Define OpenWeatherMap API key
const weatherApiKey = 'a92fd50f7bd7d64fa0b975eb44ef7c28'; // Replace with your OpenWeatherMap API key

// Define TimeZoneDB API key
const timeZoneApiKey = 'NPFZDLCK8069'; // Replace with your TimeZoneDB API key

// Function to interpolate between two colors using cubic interpolation

let isMuted = false;

function toggleMute() {
    isMuted = !isMuted;
    const muteText = document.getElementById('mute-text');
    if (isMuted) {
        // Mute sounds
        Tone.Master.mute = true;
        muteText.textContent = 'unmute';
    } else {
        // Unmute sounds
        Tone.Master.mute = false;
        muteText.textContent = 'mute';
    }
}


// Function to perform cubic interpolation between two values
function interpolateColorLinear(color1, color2, t) {
    const r = Math.round(color1[0] * (1 - t) + color2[0] * t);
    const g = Math.round(color1[1] * (1 - t) + color2[1] * t);
    const b = Math.round(color1[2] * (1 - t) + color2[2] * t);
    return [r, g, b];
}

// Function to interpolate between green, orange, and red based on AQI
function interpolateAQIColor(airQuality) {
    // Define colors for green, orange, and red
    const greenColor = [49, 209, 44];
    const orangeColor = [245, 228, 44];
    const redColor = [252, 28, 3];

    if (airQuality <= 100) {
        // Green to orange interpolation
        return interpolateColor(greenColor, orangeColor, airQuality / 100);
    } else if (airQuality <= 200) {
        // Orange to red interpolation
        return interpolateColor(orangeColor, redColor, (airQuality - 100) / 100);
    } else {
        // Beyond AQI 200, return red color
        return redColor;
    }
}

// Define a synth
const synth = new Tone.PolySynth().toDestination();

// Define a variable to store the notes of the C major scale
const cMajorScale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

// Function to play a random note from the C major scale
function playRandomNoteC() {
    const randomIndex = Math.floor(Math.random() * cMajorScale.length);
    const randomNote = cMajorScale[randomIndex];
    synth.triggerAttackRelease(randomNote, '8n');
}

// Function to play a random note from the C major or minor scale
function playRandomNoteCM() {
    // Define notes of C major and minor scales
    const cMajorScale = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    const cMinorScale = ['C4', 'D4', 'D#4', 'F4', 'G4', 'G#4', 'A#4', 'C5'];
    const scales = [cMajorScale, cMinorScale];

    // Choose a random scale
    const randomScale = scales[Math.floor(Math.random() * scales.length)];

    // Choose a random note from the selected scale
    const randomIndex = Math.floor(Math.random() * randomScale.length);
    const randomNote = randomScale[randomIndex];

    console.log('Random note:', randomNote);

    // Play the random note
    synth.triggerAttackRelease(randomNote, '8n');
}

let noteTimeouts = [];

// Function to clear all note timeouts
function clearNoteTimeouts() {
    noteTimeouts.forEach(timeout => clearTimeout(timeout));
    noteTimeouts = []; // Reset timeouts array
}

// Function to generate rectangles and play notes based on AQI range
function generateRectangles(airQuality, city) {
    // Clear note timeouts when generating new rectangles and notes
    clearNoteTimeouts();

    // Play notes based on AQI range
    if (airQuality <= 100) {
        // If AQI is between 0-100, play notes from the C major scale
        console.log('Playing notes from C major scale');
        for (let i = 0; i < airQuality; i++) {
            noteTimeouts.push(setTimeout(playRandomNoteC, i * 90)); // Introduce a delay between each note
        }
    } else {
        // If AQI is above 100, play notes from the C major or minor scale randomly
        console.log('Playing notes from C major or minor scale randomly');
        for (let i = 0; i < airQuality; i++) {
            noteTimeouts.push(setTimeout(playRandomNoteCM, i * 90)); // Introduce a delay between each note
        }
    }

    // Hold the notes until rectangles fade away
    setTimeout(() => {
        console.log('Notes stopped playing as rectangles start fading');
        // Stop playing notes or remove them, depending on your requirements
    }, airQuality * 90); // Wait until the last note has been played

    // Generate rectangles as before
    const weatherContainer = document.getElementById('weather-container');
    const previousRectangles = document.querySelectorAll(`.rectangle.${city}`);
    previousRectangles.forEach(rectangle => rectangle.remove());
    weatherContainer.innerHTML = '';

    const numRectangles = Math.floor(airQuality / 1);
    for (let i = 0; i < numRectangles; i++) {
        const rectangle = document.createElement('div');
        const sanitizedCity = city.replace(/\s/g, '');
        rectangle.classList.add('rectangle', sanitizedCity);
        const size = Math.max(1, Math.min(50, airQuality / 0.001));
        rectangle.style.width = `${size}px`;
        rectangle.style.height = `${size}px`;
        const posX = Math.random() * (window.innerWidth - size);
        const posY = Math.random() * (window.innerHeight - size);
        rectangle.style.left = `${posX}px`;
        rectangle.style.top = `${posY}px`;
        let green, red;
        if (airQuality <= 100) {
            green = Math.max(0, Math.min(255, Math.floor(255 - (airQuality / 100) * 206)));
            red = Math.floor((airQuality / 100) * 140);
        } else {
            green = 49;
            red = Math.min(255, Math.floor(((airQuality - 100) / 100) * 198) + 140);
        }
        let blue = 0;
        rectangle.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
        weatherContainer.appendChild(rectangle);
        rectangle.style.opacity = 0;
        setTimeout(() => {
            rectangle.style.opacity = 1;
        }, i * 90);
        setTimeout(() => {
            rectangle.style.opacity = 0;
            setTimeout(() => {
                rectangle.remove();
            }, 3000);
        }, (i + 1) * 50);
    }
}

// Function to update the positions of rectangles
function updateRectanglesPosition() {
    const rectangles = document.querySelectorAll('.rectangle');
    rectangles.forEach(rectangle => {
        // Get current position and size of rectangle
        const posX = parseFloat(rectangle.style.left);
        const posY = parseFloat(rectangle.style.top);
        const size = parseFloat(rectangle.style.width);

        // Calculate new position
        const newX = posX + Math.random() * 2 - 1; // Random horizontal movement between -1 and 1
        const newY = posY + Math.random() * 2 - 1; // Random vertical movement between -1 and 1

        // Check boundaries and update position
        if (newX > 0 && newX < window.innerWidth - size) {
            rectangle.style.left = `${newX}px`;
        }
        if (newY > 0 && newY < window.innerHeight - size) {
            rectangle.style.top = `${newY}px`;
        }
    });
}

// Function to fetch current time and AQI for a given latitude and longitude using APIs
async function getCurrentTimeAndAQI(latitude, longitude, city) {
    try {
        // Fetch current time using TimeZoneDB API
        const timeResponse = await fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${timeZoneApiKey}&format=json&by=position&lat=${latitude}&lng=${longitude}`);
        
        if (!timeResponse.ok) {
            throw new Error('Failed to fetch current time data.');
        }
        
        const timeData = await timeResponse.json();
        
        if (timeData.status !== 'OK') {
            throw new Error('Failed to fetch current time data.');
        }

        const currentTime = timeData.formatted;

        // Fetch air quality data using latitude and longitude
        const airQualityResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}`);
        
        if (!airQualityResponse.ok) {
            throw new Error('Failed to fetch air quality data.');
        }
        
        const airQualityData = await airQualityResponse.json();
        const airQuality = airQualityData.list[0].components.pm10 || 0; // Default to 0 if data not available

        return { currentTime, airQuality };
    } catch (error) {
        console.error(error.message);
        return { currentTime: null, airQuality: null };
    }
}

// Function to update the clock display with the current time and AQI for the selected city
async function updateCurrentTimeAndAQI(city) {
    try {
        // Fetch latitude and longitude of the city using OpenWeatherMap's Geocoding API
        const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${weatherApiKey}`;
        const geoResponse = await fetch(geoApiUrl);
        
        if (!geoResponse.ok) {
            throw new Error('Failed to fetch location data.');
        }
        
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            throw new Error('City not found.');
        }

        const latitude = geoData[0].lat;
        const longitude = geoData[0].lon;

        // Fetch current time and AQI
        const { currentTime, airQuality } = await getCurrentTimeAndAQI(latitude, longitude, city);

        if (currentTime && airQuality !== null) {
            // Extract only hours and minutes from the current time
            const [_, rawHours, minutes] = currentTime.match(/(\d{2}):(\d{2})/);
const hours = parseInt(rawHours, 10); // Parse the raw hours string into an integer

            
            // Calculate the color based on the time
// Calculate the color based on the time
console.log('Current hours:', hours);

function updateBackgroundColor(hours) {
    let backgroundColor;
    if (hours >= 21 || hours < 2) {
        // Very dark blue slightly purple background between 21:00 and 2:00
        console.log('Setting very dark blue slightly purple background');
        backgroundColor = 'rgb(52, 31, 128)';
    } else if (hours >= 2 && hours < 6) {
        // Transition from very dark blue slightly purple to light blue between 2:00 and 6:00
        console.log('Transitioning from very dark blue slightly purple to light blue');
        const t = (hours - 2) / 4; // 4 hours between 2:00 and 6:00
        const darkBluePurpleRGB = [52, 31, 128]; // RGB for very dark blue slightly purple
        const lightBlueRGB = [173, 216, 230]; // RGB for light blue
        const interpolatedColor = interpolateColorLinear(darkBluePurpleRGB, lightBlueRGB, t);
        backgroundColor = `rgb(${interpolatedColor[0]}, ${interpolatedColor[1]}, ${interpolatedColor[2]})`;
    } else if (hours >= 6 && hours < 12) {
        // Light blue background between 6:00 and 12:00
        console.log('Setting light blue background');
        backgroundColor = 'lightblue';
    } else if (hours >= 12 && hours < 21) {
        // Transition from light blue to very dark blue slightly purple between 12:00 and 21:00
        console.log('Transitioning from light blue to very dark blue slightly purple');
        const t = (hours - 12) / 9; // 9 hours between 12:00 and 21:00
        const lightBlueRGB = [173, 216, 230]; // RGB for light blue
        const darkBluePurpleRGB = [52, 31, 128]; // RGB for very dark blue slightly purple
        const interpolatedColor = interpolateColorLinear(lightBlueRGB, darkBluePurpleRGB, t);
        backgroundColor = `rgb(${interpolatedColor[0]}, ${interpolatedColor[1]}, ${interpolatedColor[2]})`;
    } else {
        // Default to light blue for other hours
        console.log('Defaulting to light blue background');
        backgroundColor = 'lightblue';
    }

    console.log('Final background color:', backgroundColor);

    // Update background color
    document.body.style.backgroundColor = backgroundColor;
}


            // Update clock with current time and AQI for the selected city
            document.getElementById('current-time').textContent = `${hours}:${minutes}`;
            document.getElementById('aqi').textContent = `air quality: ${airQuality}`;

            updateBackgroundColor(hours);

        }
    } catch (error) {
        console.error(error.message);
    }
}

// Define a function to regenerate rectangles every second
function regenerateRectangles() {
    setInterval(async function() {
        // Fetch air quality data for the current city
        const city = document.getElementById('city-title').textContent;
        await getWeatherAndAirQuality(city);
    }, 4500); // Regenerate every second
}

// When the page is loaded, fetch weather and air quality data for the default city (New York)
document.addEventListener('DOMContentLoaded', async function() {
    const defaultCity = 'New York City';
    document.getElementById('city-title').textContent = defaultCity; // Set default city in the h1
    updateCurrentTimeAndAQI(defaultCity);
    setInterval(updateRectanglesPosition, 100); // Update positions every 100 milliseconds
});

async function getWeatherAndAirQuality(city) {
    try {
        // Clear weather container before fetching data for the new city
        console.log('Clearing weather container...');
        const weatherContainer = document.getElementById('weather-container');
        weatherContainer.innerHTML = '';
        console.log('Weather container cleared.');

        // Fetch latitude and longitude of the city using OpenWeatherMap's Geocoding API
        const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${weatherApiKey}`;
        const geoResponse = await fetch(geoApiUrl);
        
        if (!geoResponse.ok) {
            throw new Error('Failed to fetch location data.');
        }
        
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            throw new Error('City not found.');
        }

        const latitude = geoData[0].lat;
        const longitude = geoData[0].lon;

        // Fetch air quality data using latitude and longitude
        const airQualityApiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}`;
        const airQualityResponse = await fetch(airQualityApiUrl);
        
        if (!airQualityResponse.ok) {
            throw new Error('Failed to fetch air quality data.');
        }
        
        const airQualityData = await airQualityResponse.json();
        const airQuality = airQualityData.list[0].components.pm10 || 0; // Default to 0 if data not available

        generateRectangles(airQuality, city);

        // Update clock with current time and AQI for the selected city
        updateCurrentTimeAndAQI(city);

        // Update city title
        document.getElementById('city-title').textContent = city;

    } catch (error) {
        alert(error.message);
    }
}


async function updateCityTitle(city) {
    try {
        // Update city title
        const cityTitle = document.getElementById('city-title');
        cityTitle.textContent = city;
        
        // Adjust city title position
        cityTitle.style.zIndex = '9999'; // Set a high z-index value
    } catch (error) {
        console.error(error.message);
    }
}



// Function to reset the search input field to its default value
function resetSearchInput() {
    document.getElementById('city-input').value = ''; // Reset input field value
    document.getElementById('city-input').placeholder = 'enter city name'; // Reset placeholder
}

// Event listener for the search button
document.getElementById('search-button').addEventListener('click', function() {
    const city = document.getElementById('city-input').value;
    getWeatherAndAirQuality(city);
    updateCurrentTimeAndAQI(city);
    resetSearchInput(); // Reset input field after search
});

