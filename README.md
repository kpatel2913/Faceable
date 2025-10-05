# Faceable: Face Your Vision.

**Live Demo:**

Welcome to **Faceable**, a groundbreaking accessibility project developed for the **Living Culture Track** at **HackHarvard2025**. Faceable eliminates the barrier of manual dexterity, allowing anyone with motor impairments to create art using only subtle head and facial movements.

## Project Summary

**Faceable** is the first creative suite to successfully utilize browser-native computer vision to transform the user's face into a high-resolution, zero-contact artistic controller. It empowers users by treating the **central facial point (nose tip)** as an **"ocular stylus,"** proving that creative genius is a function of intent, not the hands.

## Core Technology

This application is built using a modern, efficient tech stack designed for optimal performance in the browser:

* **Framework:** React with TypeScript (via Vite).

* **Styling:** Tailwind CSS (for a responsive, high-contrast user interface).

* **Computer Vision (CV):** **MediaPipe Face Landmarker** (loaded via CDN) for real-time facial feature tracking.

* **Input Logic:** Custom-built **Dwell Time Filter** and **Coordinate Smoothing** algorithms to distinguish intentional artistic strokes from accidental head jitter.

* **Canvas Engine:** HTML Canvas API for low-latency line rendering.

## Local Setup and Development

To run **Faceable** locally and test the gaze functionality using your own webcam, follow these steps:

1. **Clone the Repository:**
```
git clone [Your repository link here]
cd [your-project-folder]
```
2. **Install Dependencies:**
```
npm install
```
3. **Start the Development Server:**
```
npm run dev
```
4. **View the Application:** Open your web browser and navigate to the address displayed in the terminal (usually `http://localhost:5173`).

5. **Enable Webcam:** Ensure you grant camera permissions when prompted. The application will immediately begin processing the video feed to control the cursor.

## How to Use the App

| Action (Gesture) | Result |
| :--- | :--- |
| **Move Head** | Moves the drawing cursor on the canvas. |
| **Open Mouth** | Toggles drawing **ON** or **OFF** (acting as the virtual 'pen down' control). |
| **Smile** | Cycles through the available drawing tools (Pen, Eraser, Thick Pen). |
| **Raise Eyebrows** | Cycles through the available colors. |

*This project was developed for the **Living Culture Track: Reimagine creativity with digital innovation** at **HackHarvard2025**.*
