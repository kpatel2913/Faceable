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
