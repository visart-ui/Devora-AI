# YouTube Clip Generator

A web application that generates random 30-60 second clips from YouTube videos in 9:16 aspect ratio (vertical format).


## Features

- 🎥 Input any YouTube video URL
- ⚡ Generates 10 random clips from the video
- 🕒 Each clip is 30-60 seconds long
- 📱 All clips formatted in 9:16 (vertical) aspect ratio
- ▶️ Preview clips directly on YouTube
- 🎨 Modern teal/white/blue UI with clean design
- 📱 Fully responsive for mobile and desktop

## How It Works

1. User pastes a YouTube URL
2. System generates 10 random non-overlapping segments
3. Each segment is 30-60 seconds long
4. Clips are displayed in a responsive grid
5. Users can preview clips by clicking the play button

## Technologies Used

### Frontend

- HTML5
- CSS3 (with CSS variables)
- JavaScript (ES6)
- [Poppins Google Font](https://fonts.google.com/specimen/Poppins)

### Backend (potential future implementation)

- YouTube Data API
- FFmpeg for video processing
- Node.js/Express server

## Setup Instructions

### Option 1: GitHub Pages (Easiest)

1. Fork this repository
2. Rename your repo to `username.github.io` (replace username with your GitHub username)
3. Your site will be live at `https://username.github.io`

### Option 2: Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/youtube-clip-generator.git
