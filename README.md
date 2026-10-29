<div align="center">

<img src="/public/assets/ISS Live Tracker Mission Patch.png" alt="Cosmic ISS Tracker Logo" width="200" style="border-radius: 24px;" />

# Cosmic ISS Tracker

**Watching the International Space Station seeing where it is in the sky and what you need to know about it.**

<br />

<!-- Project Badges -->

<img src="https://img.shields.io/badge/Platform-Web_Browser-00ffcc?style=flat&logo=googlechrome&logoColor=black" alt="Web Browser" />
<img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat" alt="License: MIT" />
<a href="https://github.com/shashwatak/satellite-js"><img src="https://img.shields.io/badge/Orbit_Engine-Satellite.js_(SGP4)-FF6B00?style=flat" alt="Satellite.js" /></a>
<img src="https://img.shields.io/badge/Nasa-Pictures-blue?logo=nasa" />

</div>

---

## Overview

The ***Cosmic ISS Tracker*** is a web app built with React. It lets users watch the International Space Station (ISS) and calculate when it will be visible from any place on Earth. You can start using the Cosmic ISS Tracker away in any web browser and there is no need to download additional software. It also gives details about the ISS’s parts. Shows photos taken on board.

---

## Key Features

* **Browser-Based Live Map (`Space` Component):** Shows the position of the ISS, the chosen observer location and the ground track from 46 minutes ago to 138 minutes ahead. The map uses a high‑resolution NASA night image. Runs directly in the browser.

* **Crew and Docked Spacecraft List:** Shows how many astronauts are on the station and lists every spacecraft that is docked. Hover over an entry to see the crew and vehicle names.

* **Mission History Tracker:** Keeps a count of how many orbits the ISS has completed since its launch on November 20 1998 using a 92.68‑minute orbit period. It also shows how consecutive days the station has been occupied since November 2 2000 and lists historic visitor (280+) and expedition (76) numbers.

* **. Photos:** Open the "Little ISS" part of the Tracker menu to read about the ISS and its parts and when they started working there. A few photos appear in the "Learn About the ISS" section.

---

## APIs

* **WhereTheISS.at API:** Gives the ISS’s coordinates the TLE data for its orbit, country codes and the time zone based on coordinates.

* **OpenStreetMap Nominatim API:** Helps find cities by name. Find city names from coordinates along the ISS path.

* **BigDataCloud API:** Detects which seas and oceans the ISS passes over.

* **Corquaid ISS APIs:** Provides live JSON data for the crew (`people-in-space.json`) and docked spacecraft (`iss-docked-spacecraft.json`).

* **NASA Science Assets:** Supplies high‑resolution night‑time maps of the world.

---

## Getting Started

* Step 1: Click the link to visit the Cosmic ISS Tracker website: [Cosmic ISS Tracker](https://cosmic-iss-tracker.netlify.app/)

* Step 2: Scroll down to the ISS icon in the navigation menu and click on `ISS Tracker`.

* Step 3: Click the `Enter your City...` field type the name of your city.

That is all. The Cosmic ISS Tracker will now compute when the ISS will next fly over your place so you can watch it. Remember to scroll below the tracker—there is information, about the ISS waiting for you.

**Have Fun :D**