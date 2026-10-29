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

The ***Cosmic ISS Tracker*** is a web app built with React. It allows users to observe the International Space Station (ISS) and determine its visibility from any location on Earth. You can start using the Cosmic ISS Tracker right away in any web browser — no additional software is required. It also provides information about the ISS's components. It shows photos taken on board.

---

## Key Features

* **Browser-Based Live Map:** It shows the position of the ISS, the chosen observer location, and the ground track from 46 minutes ago to 138 minutes ahead. The map uses a high-resolution NASA night-time image. It runs directly in the browser.

* **Crew and Docked Spacecraft List:** It shows how many astronauts are on the station and lists every docked spacecraft. Hover over an entry to view the crew and vehicle names.

* **Mission History Tracker:** It keeps a count of how many orbits the ISS has completed since its launch on 20 November 1998, with an orbit period of 92.68 minutes. It also shows how many consecutive days the station has been occupied since 2 November 2000, and lists the number of historic visitors (over 280) and expeditions (76).

* **Photos:** Open the 'Little ISS' section of the Tracker menu to read about the ISS, its components, and when they began operating. The "Learn About the ISS" section contains a few photos.

---

## APIs

* **WhereTheISS.at API:** It provides the coordinates of the ISS, the TLE data for its orbit, country codes, and the time zone based on the coordinates.

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