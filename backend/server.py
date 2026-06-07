import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import pydantic
import os

app = FastAPI(title="Live CV Filter Engine Backend")

# Enable CORS so your MacBook (Machine B) can send control signals
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State Variables for the Stream Pipeline
class FilterState:
    def __init__(self):
        self.current_filter = "dim"  # Options: 'normal', 'dim', 'blur', 'pixelate'
        self.dim_factor = 0.3
        self.blur_strength = 25
        self.pixelate_blocks = 16

state = FilterState()

class FilterUpdateRequest(pydantic.BaseModel):
    filter_mode: str

# Modern MediaPipe Tasks Setup
BaseOptions = mp.tasks.BaseOptions
ImageSegmenter = mp.tasks.vision.ImageSegmenter
ImageSegmenterOptions = mp.tasks.vision.ImageSegmenterOptions
VisionRunningMode = mp.tasks.vision.RunningMode

MODEL_PATH = os.path.join(os.path.dirname(__file__), "selfie_segmenter_landscape.tflite")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Missing model file! Download selfie_segmenter.task and place it at: {MODEL_PATH}")

# Configure the Segmenter options
options = ImageSegmenterOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=VisionRunningMode.IMAGE, # Optimizing frame-by-frame for our streaming loop
    output_category_mask=True
)

# Initialize the segmenter engine
segmentor = ImageSegmenter.create_from_options(options)

# Filter Operations
def apply_dim(bg_zone):
    return cv2.multiply(bg_zone, np.array([state.dim_factor]))

def apply_blur(bg_zone):
    return cv2.GaussianBlur(bg_zone, (state.blur_strength, state.blur_strength), 0)

def apply_pixelate(bg_zone, width, height):
    low_w = max(1, width // state.pixelate_blocks)
    low_h = max(1, height // state.pixelate_blocks)
    small = cv2.resize(bg_zone, (low_w, low_h), interpolation=cv2.INTER_LINEAR)
    return cv2.resize(small, (width, height), interpolation=cv2.INTER_NEAREST)

def generate_frames():
    """Video streaming generator function using Tasks API."""
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    while True:
        success, frame = cap.read()
        if not success:
            break
        
        frame = cv2.flip(frame, 1)
        height, width, _ = frame.shape
        
        # Convert BGR frame to RGB for MediaPipe compliance
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Wrap numpy array into MediaPipe Image object
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        
        # Perform segmentation inference
        segmentation_result = segmentor.segment(mp_image)
        category_mask = segmentation_result.category_mask.numpy_view()
        
        # Portrait extraction condition (User vs Background thresholding)
        # Category mask output values run near 1.0 (or 255 scaled) for human foreground pixels
        mask_3d = cv2.merge([category_mask, category_mask, category_mask]) 
        condition = mask_3d > 0.1
        
        fg_zone = frame.copy()
        bg_zone = frame.copy()
        
        if state.current_filter == 'dim':
            processed_bg = apply_dim(bg_zone)
        elif state.current_filter == 'blur':
            processed_bg = apply_blur(bg_zone)
        elif state.current_filter == 'pixelate':
            processed_bg = apply_pixelate(bg_zone, width, height)
        else:
            processed_bg = bg_zone
            
        output_frame = np.where(condition, processed_bg, fg_zone)
        
        # Encode back to JPEG for stream output
        ret, buffer = cv2.imencode('.jpg', output_frame)
        if not ret:
            continue
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

@app.get("/video_feed")
def video_feed():
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.post("/set_filter")
def set_filter(payload: FilterUpdateRequest):
    valid_filters = ["normal", "dim", "blur", "pixelate"]
    if payload.filter_mode in valid_filters:
        state.current_filter = payload.filter_mode
        return {"status": "success", "active_filter": state.current_filter}
    return {"status": "error", "message": "Invalid filter mode string submitted."}

@app.get("/status")
def get_status():
    return {"status": "online", "active_filter": state.current_filter}