<div align="center">
  <img src="/public/assets/ISS Live Tracker Mission Patch.png" alt="Cosmic ISS Tracker Logo" width="200" style="border-radius: 24px;" />

  # Cosmic ISS Tracker

  **Real-Time Telemetry, Global Orbit Visualization, Astronomical Pass Prediction, and Things You Should Know for and about the International Space Station**

  <br />

  <!-- Project Badges -->
  <img src="https://img.shields.io/badge/Platform-Web_Browser-00ffcc?style=flat&logo=googlechrome&logoColor=black" alt="Web Browser" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat" alt="License: MIT" />
  <a href="https://github.com/shashwatak/satellite-js"><img src="https://img.shields.io/badge/Orbit_Engine-Satellite.js_(SGP4)-FF6B00?style=flat" alt="Satellite.js" /></a>
  <img src="https://img.shields.io/badge/Nasa-Pictures-blue?logo=nasa" />
</div>

---

## Overview

**Cosmic ISS Tracker** is a browser-based React web application engineered for real-time tracking of the International Space Station (ISS) and calculating visible flyovers for any location on Earth. Accessible directly via any modern web browser without additional software installation, the application combines live telemetry streams with SGP4 mathematical orbital propagation to render both global trajectories and local sky visibility windows. It also provides more information about the components of the ISS, as well as photos taken there.

---

## Key Features

* **Browser-Based Real-Time Map (`Space` Component):** Renders the live position of the ISS, the selected observer location, and the computed orbital ground track (from 46 minutes in the past to 138 minutes into the future) on a high-resolution NASA night map directly in the browser.
* **Live Telemetry and Enhanced Ground Track:** Polls live orbital data every 5 seconds to display altitude (km), velocity (km/h), and geographic coordinates. The ground track automatically resolves coordinates into full country names and the nearest city or region, or indicates the correct seas and oceans when the ISS flies over them. 
* **Crew and Docked Spacecraft Manifest:** Displays the current number of astronauts aboard the station alongside all currently docked spacecraft, featuring a hover overlay for detailed crew and vehicle names.
* **Lifetime Mission Archive:** Continuously computes the total number of orbits completed since the initial launch on November 20, 1998 (based on a 92.68-minute orbital period) and the consecutive days inhabited since November 2, 2000, alongside historical visitor (280+) and expedition (76) statistics.
* **5-Day Astronomical Pass Predictor:** Scans the upcoming five days in 1-minute intervals for any searched city to identify visible passes. A flyover is strictly registered when the ISS reaches an elevation of at least 10 degrees above the horizon, the observer's location is in sufficient darkness (solar elevation at or below -6 degrees), and the station is illuminated by sunlight (solar elevation at or above -21 degrees).
* **Interactive Trajectory Breakdown:** Clicking any predicted pass opens an interactive modal (`PassMapModal`) featuring a localized zoom map, the dashed flight path, Acquisition of Signal (AOS / appearance point), Loss of Signal (LOS / disappearance point), compass directions, peak elevation, and a visibility grade.
* **Automatic Timezone Synchronization:** Dynamically synchronizes the main mission clock and all predicted pass timestamps to match the local timezone of the searched location.
* **Learning and Pictures:** Use the “Little ISS” section under ‘Tracker’ to learn more about the ISS and its components, and when they began serving on the ISS. There are also a few pictures under the “Learn About the ISS” section.

---

## Tech Stack and APIs

### Core Libraries
* **React (`useState`, `useEffect`, `useMemo`):** Component architecture, state management, and telemetry polling lifecycle.
* **Satellite.js:** SGP4 orbital propagation for computing satellite positions, look angles (azimuth and elevation), and geodetic coordinates from Two-Line Element (TLE) sets.
* **Framer Motion (`motion`, `AnimatePresence`):** Smooth UI transitions, animated ground track text updates, radar pulse keyframes, and modal transitions.
* **Tailwind CSS:** Responsive dark-mode interface styling.

### External Data Sources
* **WhereTheISS.at API:** Real-time ISS coordinates, TLE orbital elements, country codes, and coordinate-based timezone resolution.
* **OpenStreetMap Nominatim API:** Forward geocoding for city searches and reverse geocoding for resolving cities and regions along the ISS ground track.
* **BigDataCloud API:** Identify the correct seas and oceans along the ISS ground track.
* **Corquaid International Space Station APIs:** Live JSON feeds for current crew members (`people-in-space.json`) and docked spacecraft (`iss-docked-spacecraft.json`).
* **NASA Science Assets:** High-resolution global night map imagery.

---

## Getting Started 

* Step 1: You need to click on this link, to get to the website: [Cosmic ISS Tracker](https://cosmic-iss-tracker.netlify.app/)
* Step 2: Scroll down to a small ISS with a navigation menu. Click on `ISS Tracker` there.
* Step 3: Go to the `Enter your City...` field, click in the field and type in your city.

That's it. The tracker will now calculate when the ISS will next pass over your location so you can see it. Don't forget to scroll down past the tracker—there's a bit more information about the ISS waiting for you there.

**Have Fun :D**