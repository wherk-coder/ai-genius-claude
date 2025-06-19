from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from PIL import Image
import pytesseract
import io
import re
from typing import Optional, List, Dict
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(
    title="Receipt Scanner API",
    description="OCR service for scanning betting receipts",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ReceiptData(BaseModel):
    """Structured receipt data extracted from OCR"""
    sportsbook: Optional[str] = None
    bet_type: Optional[str] = None
    amount: Optional[float] = None
    odds: Optional[str] = None
    teams: List[str] = []
    date: Optional[str] = None
    ticket_number: Optional[str] = None
    raw_text: str
    confidence: float

def preprocess_image(image: np.ndarray) -> np.ndarray:
    """Preprocess image for better OCR results"""
    # Convert to grayscale if needed
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
    
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (3, 3), 0)
    
    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    
    # Morphological operations to clean up
    kernel = np.ones((1, 1), np.uint8)
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    
    return cleaned

def extract_receipt_data(text: str) -> ReceiptData:
    """Extract structured data from raw OCR text"""
    lines = text.split('\n')
    
    # Common sportsbook names
    sportsbooks = ['DraftKings', 'FanDuel', 'BetMGM', 'PointsBet', 'Caesars', 'WynnBET', 'Barstool']
    
    data = ReceiptData(raw_text=text, confidence=0.8)
    
    # Extract sportsbook
    for line in lines:
        for book in sportsbooks:
            if book.lower() in line.lower():
                data.sportsbook = book
                break
    
    # Extract bet amount (look for $ patterns)
    amount_pattern = r'\$(\d+\.?\d*)'
    for line in lines:
        match = re.search(amount_pattern, line)
        if match:
            try:
                data.amount = float(match.group(1))
                break
            except ValueError:
                continue
    
    # Extract odds (look for +/- patterns)
    odds_pattern = r'[+-]\d+'
    for line in lines:
        match = re.search(odds_pattern, line)
        if match:
            data.odds = match.group(0)
            break
    
    # Extract potential team names (basic approach)
    team_keywords = ['vs', 'at', '@', 'over', 'under']
    for line in lines:
        for keyword in team_keywords:
            if keyword.lower() in line.lower():
                # Split around the keyword and extract potential team names
                parts = re.split(f'\\b{keyword}\\b', line, flags=re.IGNORECASE)
                if len(parts) >= 2:
                    team1 = parts[0].strip()
                    team2 = parts[1].strip()
                    if team1 and team2:
                        data.teams = [team1, team2]
                        break
    
    # Extract date patterns
    date_patterns = [
        r'\d{1,2}/\d{1,2}/\d{4}',
        r'\d{1,2}-\d{1,2}-\d{4}',
        r'\w+ \d{1,2}, \d{4}'
    ]
    for line in lines:
        for pattern in date_patterns:
            match = re.search(pattern, line)
            if match:
                data.date = match.group(0)
                break
        if data.date:
            break
    
    # Extract ticket/reference number
    ticket_patterns = [
        r'Ticket\s*#?\s*(\w+)',
        r'Reference\s*#?\s*(\w+)',
        r'ID\s*#?\s*(\w+)'
    ]
    for line in lines:
        for pattern in ticket_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                data.ticket_number = match.group(1)
                break
        if data.ticket_number:
            break
    
    # Determine bet type based on keywords
    bet_type_keywords = {
        'moneyline': ['moneyline', 'ml', 'to win'],
        'spread': ['spread', 'point spread', '+', '-'],
        'total': ['total', 'over', 'under', 'o/', 'u/'],
        'parlay': ['parlay', 'multi', 'combo'],
        'prop': ['prop', 'player', 'first', 'anytime']
    }
    
    text_lower = text.lower()
    for bet_type, keywords in bet_type_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            data.bet_type = bet_type
            break
    
    return data

@app.post("/scan", response_model=ReceiptData)
async def scan_receipt(file: UploadFile = File(...)):
    """Scan uploaded receipt image and extract betting data"""
    
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert PIL image to numpy array
        image_np = np.array(image)
        
        # Preprocess image
        processed_image = preprocess_image(image_np)
        
        # Perform OCR
        raw_text = pytesseract.image_to_string(processed_image, config='--psm 6')
        
        if not raw_text.strip():
            raise HTTPException(status_code=422, detail="No text could be extracted from image")
        
        # Extract structured data
        receipt_data = extract_receipt_data(raw_text)
        
        return receipt_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "receipt-scanner"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)