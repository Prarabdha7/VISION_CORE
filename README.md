# VISION_CORE // Distributed Real-Time Edge Matrix

A high-performance, cross-platform distributed computer vision application that isolates a user from their background in a live video feed and applies mathematically optimized filters in real time.

The architecture divides responsibilities across a local network cluster: the Host Processing Node handles neural network segmentation inference and pixel matrix calculations using hardware acceleration, while the Client Dashboard Node serves a responsive, dark-mode Bento Grid control panel to toggle and tune filters over a low-latency network bridge.

---

## System Architecture

The application is structured as a decentralized, edge-compute ecosystem communicating via an asynchronous REST API for control planes and an un-buffered HTTP Multipart stream (MJPEG) for data planes.

```text
┌──────────────────────────────────────┐          Low-Latency Local LAN Bridge          ┌──────────────────────────────────────┐
│  HOST PROCESSING NODE                │◄───────────────────────────────────────────────┤  CLIENT DASHBOARD NODE               │
│  (Python FastAPI Backend Server)     │                                                │  (Vite + React / Tailwind CSS v4)    │
├──────────────────────────────────────┤  1. HTTP GET /status (Heartbeat Check)         ├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │───────────────────────────────────────────────►│  ┌────────────────────────────────┐  │
│  │ OpenCV Camera Capture Loop     │  │                                                │  │ Premium Glassmorphic Bento UI  │  │
│  └───────────────┬────────────────┘  │  2. HTTP POST /set_filter (JSON Control state) │  └───────────────┬────────────────┘  │
│                  ▼                   │◄───────────────────────────────────────────────┤                  │                   │
│  ┌────────────────────────────────┐  │                                                │                  ▼                   │
│  │ MediaPipe Tasks Segmenter      │  │  3. HTTP GET /video_feed (MJPEG Frame Stream)  │  ┌────────────────────────────────┐  │
│  └───────────────┬────────────────┘  │───────────────────────────────────────────────►│  │ Live <img> Canvas Node Monitor │  │
│                  ▼                   │                                                │  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │                                                └──────────────────────────────────────┘
│  │ NumPy Matrix / CV Operations   │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

### Core Communications Flow
1. The Handshake / Heartbeat: Upon loading, the Client Node executes an asynchronous fetch request to the Host Node's /status endpoint to verify connectivity and capture the current system configurations.
2. The Data Pipeline (MJPEG over HTTP): The Host Node's camera thread captures hardware frames, feeds them into the MediaPipe landscape segmenter, computes the active filter matrix, and packages the result into un-buffered JPEG bytes. This is streamed via an HTTP multipart/x-mixed-replace boundary directly to an HTML5 <img> tag on the client interface, optimizing decoding performance.
3. The Control Plane (REST API): Interactive buttons on the frontend dispatch asynchronous JSON payloads to the Host Node's /set_filter endpoint, dynamically updating state variables inside the processing loop without interrupting or lagging the active video feed.

---

## Visual Preview and Dashboards

### Distributed Cluster Panel (Normal Pass)
![alt text](<public/Screenshot 2026-06-08 at 4.43.37 PM.png>)

### Real-Time Filter States
| Background Dimmer | Gaussian Blur | Pixel Mosaic |
|---|---|---|
| ![alt text](<public/Screenshot 2026-06-08 at 4.53.54 PM.png>) | ![alt text](<public/Screenshot 2026-06-08 at 4.43.49 PM.png>) | ![alt text](<public/Screenshot 2026-06-08 at 4.54.00 PM.png>) |

---

## Features and Capabilities

* Modern AI Face Segmentation: Powered by Google MediaPipe's Task Vision API, tracking human portraits accurately down to individual hairs without needing generic green screens or tracking markers.
* Low-Overhead Image Processing Engine: Utilizes NumPy matrix slices and native OpenCV operations (cv2.merge, cv2.GaussianBlur, cv2.resize) to eliminate stutters.
* Zero-Config Tailwind CSS v4 Framework: Built using React paired with Vite and Tailwind v4's unified architecture for sub-millisecond styling compilation.
* Bento Grid Dashboard Interface: Clean grid theme displaying system diagnostics, pipeline metrics, cluster states, and real-time network statuses.
* Robust CORS and Networking Bridge: Explicitly mapped network configurations allow nodes to safely transition data over home routers or local infrastructure.

---

## Filter Execution Profile

| Filter Mode | Underlying Mathematical / CV Operation | Performance Impact |
| :--- | :--- | :--- |
| **Normal Pass** | Passes unmodified frame tensors directly through the conditional array pipeline. | Minimal (0-1% CPU Overhead) |
| **Background Dimmer** | Executes a scalar element-wise matrix multiplication (cv2.multiply) by 0.3 on background pixels. | Nominal (Broadcasting scale) |
| **Gaussian Blur** | Convolves the background array with a large 25x25 spatial kernel window matrix. | High (Compute intensive) |
| **Pixel Mosaic** | Scales the background down with a linear interpolation block, then blows it back up using Nearest-Neighbor (cv2.INTER_NEAREST). | Moderate (Dual interpolation steps) |

---

## System Requirements and Prerequisites

### Host Processing Node (Backend)
* OS: Windows 10/11, macOS, or Linux
* Environment: Python 3.10 or higher
* Dependencies: fastapi, uvicorn, opencv-python, mediapipe, numpy, pydantic
* Network Infrastructure: Unblocked inbound port access on 8000 via local firewalls.

### Client Dashboard Node (Frontend)
* OS: Windows 10/11, macOS, or Linux
* Environment: Node.js v18.0.0 or higher
* Dependencies: Vite, React, @tailwindcss/vite

---

## Step-by-Step Installation and Deployment

### 1. Host Processing Node Setup

1. Open your terminal in the backend project directory and initialize your workspace environment:
   ```bash
   cd backend
   python -m venv venv
   ```
2. Activate your virtual isolation container:
   * Windows (PowerShell): `.\venv\Scripts\activate`
   * Windows (CMD): `.\venv\Scripts\activate.bat`
   * macOS/Linux: `source venv/bin/activate`
3. Install the explicit requirements array:
   ```bash
   pip install fastapi uvicorn opencv-python mediapipe numpy pydantic
   ```
4. Download the portrait segmentation model weight mesh binary (selfie_segmenter_landscape.tflite) from the official Google MediaPipe repository and place it directly inside your backend/ directory.
5. If running on Windows, grant network visibility permissions to your server application by running PowerShell as an Administrator and adding this firewall entry:
   ```powershell
   New-NetFirewallRule -DisplayName "FastAPI Stream Server" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
   ```
6. Spin up the processing node to broadcast network-wide:
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8000 --reload
   ```

### 2. Client Dashboard Node Setup

1. Open a terminal in your project frontend folder:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies using Node Package Manager:
   ```bash
   npm install
   ```
3. Open src/App.jsx in your code editor, locate the BACKEND_IP global string, and configure it to point directly at your host machine's local router IP:
   ```javascript
   const BACKEND_IP = "YOUR_HOST_LOCAL_IP_ADDRESS"; // Example: "192.168.1.15"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Click the local loopback browser link outputted in your console terminal to launch the dashboard.

---

## Diagnostics and Verification Guide

* Node Status shows 'OFFLINE'? Check that both machines are connected to the exact same local area network subnet, verify that you replaced the BACKEND_IP variable in App.jsx with the correct IPv4 address, and ensure that the backend application thread is actively running.
* Webcam isn't launching? Ensure no other desktop communication software or background process is currently keeping your webcam hardware handles locked.
* Face is getting modified instead of background? Navigate to backend/server.py inside the frame iteration logic and verify that your array conditional map positions are ordered correctly: `np.where(condition, processed_bg, fg_zone)`.

---

## Project Structure
```text
live-vision-filter/
├── backend/
│   ├── venv/
│   ├── server.py                        # FastAPI Server & Computer Vision pipeline
│   └── selfie_segmenter_landscape.tflite # MediaPipe quantized neural weight file
├── frontend/
│   ├── src/
│   │   ├── App.jsx                      # Bento Dashboard Interface layout
│   │   └── index.css                    # Tailwind Directive Framework container
│   ├── package.json
│   └── vite.config.js                   # Tailwind Plugin bundler module
└── .gitignore
```
