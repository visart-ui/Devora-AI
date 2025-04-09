const express = require('express');
const axios = require('axios');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const cors = require('cors');

// Configure FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const TEMP_DIR = path.join(__dirname, 'temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

// YouTube API Key (you need to get this from Google Cloud Console)
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Get video duration from YouTube API
app.get('/api/video-duration', async (req, res) => {
    try {
        const { videoId } = req.query;
        
        const response = await axios.get(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${YOUTUBE_API_KEY}`
        );
        
        const duration = response.data.items[0].contentDetails.duration;
        // Convert ISO 8601 duration to seconds
        const seconds = convertYouTubeDuration(duration);
        
        res.json({ duration: seconds });
    } catch (error) {
        console.error('Error getting duration:', error);
        res.status(500).json({ error: 'Failed to get video duration' });
    }
});

// Generate and download a single clip
app.post('/api/download-clip', async (req, res) => {
    try {
        const { videoId, start, end, aspectRatio } = req.body;
        const duration = end - start;
        
        // Validate input
        if (duration < 30 || duration > 60) {
            return res.status(400).json({ error: 'Clip duration must be between 30-60 seconds' });
        }
        
        // Generate unique filename
        const tempFilePath = path.join(TEMP_DIR, `clip-${videoId}-${start}-${end}.mp4`);
        
        // Download and process the video
        await processVideoClip(videoId, start, duration, aspectRatio, tempFilePath);
        
        // Stream the file back to client
        res.download(tempFilePath, () => {
            // Clean up the temp file after download completes
            fs.unlink(tempFilePath, (err) => {
                if (err) console.error('Error deleting temp file:', err);
            });
        });
    } catch (error) {
        console.error('Error generating clip:', error);
        res.status(500).json({ error: 'Failed to generate clip' });
    }
});

// Export all clips as ZIP
app.post('/api/export-clips', async (req, res) => {
    try {
        const { videoId } = req.body;
        
        // In a real implementation, you would:
        // 1. Get the clip segments (either from request or regenerate)
        // 2. Process each clip
        // 3. Package them into a ZIP
        
        // For this example, we'll just return an error
        // since processing 10 clips would take significant time/resources
        res.status(501).json({ error: 'Bulk export not implemented in this example' });
        
        /* Real implementation would look more like this:
        const zipFilePath = path.join(TEMP_DIR, `clips-${videoId}.zip`);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        archive.pipe(output);
        
        // Process and add each clip to the archive
        for (const clip of clips) {
            const clipPath = await processVideoClip(videoId, clip.start, clip.duration, '9:16');
            archive.file(clipPath, { name: `clip-${clip.start}-${clip.end}.mp4` });
        }
        
        await archive.finalize();
        
        res.download(zipFilePath, () => {
            fs.unlink(zipFilePath, (err) => {
                if (err) console.error('Error deleting zip file:', err);
            });
        });
        */
    } catch (error) {
        console.error('Error exporting clips:', error);
        res.status(500).json({ error: 'Failed to export clips' });
    }
});

// Helper function to process a video clip
async function processVideoClip(videoId, startTime, duration, aspectRatio, outputPath) {
    return new Promise((resolve, reject) => {
        // Get YouTube video stream
        const videoStream = ytdl(`https://www.youtube.com/watch?v=${videoId}`, {
            quality: 'highest',
            filter: format => format.container === 'mp4' && format.hasVideo
        });
        
        // Calculate crop dimensions for 9:16 aspect ratio
        let cropFilter = '';
        if (aspectRatio === '9:16') {
            cropFilter = 'crop=ih*9/16:ih';
        }
        
        // Process with FFmpeg
        ffmpeg(videoStream)
            .setStartTime(startTime)
            .setDuration(duration)
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions([
                '-movflags frag_keyframe+empty_moov',
                '-preset fast',
                '-crf 22'
            ])
            .size('720x1280') // 9:16 resolution
            .output(outputPath)
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(err))
            .run();
    });
}

// Convert YouTube's ISO 8601 duration to seconds
function convertYouTubeDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (parseInt(match[1])) || 0;
    const minutes = (parseInt(match[2])) || 0;
    const seconds = (parseInt(match[3])) || 0;
    return hours * 3600 + minutes * 60 + seconds;
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});