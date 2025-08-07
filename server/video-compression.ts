import ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';

// Set the ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

interface CompressionOptions {
  maxSizeMB?: number;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  format?: 'mp4' | 'webm';
  maxWidth?: number;
  maxHeight?: number;
}

interface CompressionResult {
  success: boolean;
  compressedBuffer?: Buffer;
  originalSize: number;
  compressedSize?: number;
  compressionRatio?: number;
  error?: string;
}

export class VideoCompressionService {
  private static readonly DEFAULT_OPTIONS: Required<CompressionOptions> = {
    maxSizeMB: 50,
    quality: 'medium',
    format: 'mp4',
    maxWidth: 1920,
    maxHeight: 1080
  };

  /**
   * Compresses a video file with smart quality adjustment
   * @param inputBuffer - The video file buffer
   * @param originalName - Original filename for extension detection
   * @param options - Compression options
   * @returns Promise with compression result
   */
  static async compressVideo(
    inputBuffer: Buffer,
    originalName: string,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const originalSize = inputBuffer.length;
    const maxSizeBytes = opts.maxSizeMB * 1024 * 1024;

    console.log(`Starting video compression for ${originalName}`);
    console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Target max size: ${opts.maxSizeMB}MB`);

    // If file is already small enough, return as-is
    if (originalSize <= maxSizeBytes) {
      console.log('Video is already within size limits, no compression needed');
      return {
        success: true,
        compressedBuffer: inputBuffer,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1
      };
    }

    // Create temporary directory for processing
    const tempDir = path.join(process.cwd(), 'temp-video-compression');
    await fs.mkdir(tempDir, { recursive: true });

    const timestamp = Date.now();
    const inputPath = path.join(tempDir, `input-${timestamp}.${this.getFileExtension(originalName)}`);
    const outputPath = path.join(tempDir, `output-${timestamp}.${opts.format}`);

    try {
      // Write input buffer to temporary file
      await fs.writeFile(inputPath, inputBuffer);

      // Get video info first
      const videoInfo = await this.getVideoInfo(inputPath);
      console.log('Video info:', videoInfo);

      // Calculate optimal compression settings
      const compressionSettings = this.calculateCompressionSettings(
        videoInfo,
        originalSize,
        maxSizeBytes,
        opts
      );

      console.log('Compression settings:', compressionSettings);

      // Perform compression
      const compressedBuffer = await this.performCompression(
        inputPath,
        outputPath,
        compressionSettings
      );

      const compressedSize = compressedBuffer.length;
      const compressionRatio = originalSize / compressedSize;

      console.log(`Compression completed:`);
      console.log(`- Original: ${(originalSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`- Compressed: ${(compressedSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`- Ratio: ${compressionRatio.toFixed(2)}x`);

      return {
        success: true,
        compressedBuffer,
        originalSize,
        compressedSize,
        compressionRatio
      };

    } catch (error) {
      console.error('Video compression failed:', error);
      return {
        success: false,
        originalSize,
        error: error instanceof Error ? error.message : 'Unknown compression error'
      };
    } finally {
      // Cleanup temporary files
      try {
        await fs.unlink(inputPath).catch(() => {});
        await fs.unlink(outputPath).catch(() => {});
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Get video information using ffprobe
   */
  private static async getVideoInfo(inputPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }

  /**
   * Calculate optimal compression settings based on video info and size constraints
   */
  private static calculateCompressionSettings(
    videoInfo: any,
    originalSize: number,
    maxSizeBytes: number,
    options: Required<CompressionOptions>
  ) {
    const video = videoInfo.streams.find((s: any) => s.codec_type === 'video');
    const duration = parseFloat(videoInfo.format.duration || '0');
    
    // Calculate target bitrate based on desired file size
    const targetBitrate = Math.floor((maxSizeBytes * 8) / duration / 1000 * 0.9); // 90% of max to leave room for audio
    
    // Quality presets
    const qualityPresets = {
      ultra: { crf: 18, preset: 'slow' },
      high: { crf: 22, preset: 'medium' },
      medium: { crf: 26, preset: 'fast' },
      low: { crf: 30, preset: 'veryfast' }
    };

    const qualitySettings = qualityPresets[options.quality];
    
    // Calculate output resolution
    const originalWidth = video?.width || 1920;
    const originalHeight = video?.height || 1080;
    const aspectRatio = originalWidth / originalHeight;
    
    let outputWidth = Math.min(originalWidth, options.maxWidth);
    let outputHeight = Math.min(originalHeight, options.maxHeight);
    
    // Maintain aspect ratio
    if (outputWidth / outputHeight !== aspectRatio) {
      if (outputWidth / aspectRatio <= options.maxHeight) {
        outputHeight = Math.round(outputWidth / aspectRatio);
      } else {
        outputWidth = Math.round(outputHeight * aspectRatio);
      }
    }
    
    // Ensure dimensions are even (required for some codecs)
    outputWidth = Math.floor(outputWidth / 2) * 2;
    outputHeight = Math.floor(outputHeight / 2) * 2;

    return {
      ...qualitySettings,
      targetBitrate,
      outputWidth,
      outputHeight,
      originalWidth,
      originalHeight,
      format: options.format
    };
  }

  /**
   * Perform the actual compression using ffmpeg
   */
  private static async performCompression(
    inputPath: string,
    outputPath: string,
    settings: any
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);

      // Video codec settings
      if (settings.format === 'webm') {
        command = command
          .videoCodec('libvpx-vp9')
          .audioCodec('libopus');
      } else {
        command = command
          .videoCodec('libx264')
          .audioCodec('aac');
      }

      // Apply compression settings
      command = command
        .outputOptions([
          `-preset ${settings.preset}`,
          `-crf ${settings.crf}`,
          `-maxrate ${settings.targetBitrate}k`,
          `-bufsize ${settings.targetBitrate * 2}k`,
          `-movflags +faststart`, // For web streaming
          `-pix_fmt yuv420p` // Ensure compatibility
        ])
        .size(`${settings.outputWidth}x${settings.outputHeight}`)
        .output(outputPath);

      // Execute compression
      command
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            console.log(`Compression progress: ${Math.round(progress.percent)}%`);
          }
        })
        .on('end', async () => {
          try {
            const compressedBuffer = await fs.readFile(outputPath);
            resolve(compressedBuffer);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('FFmpeg error:', error);
          reject(error);
        })
        .run();
    });
  }

  /**
   * Get file extension from filename
   */
  private static getFileExtension(filename: string): string {
    const ext = path.extname(filename).toLowerCase().slice(1);
    return ext || 'mp4';
  }

  /**
   * Check if file is a video based on extension
   */
  static isVideoFile(filename: string): boolean {
    const videoExtensions = [
      'mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 
      'm4v', '3gp', 'mpg', 'mpeg', 'ogv'
    ];
    const ext = this.getFileExtension(filename);
    return videoExtensions.includes(ext);
  }

  /**
   * Estimate compression time based on file size and quality
   */
  static estimateCompressionTime(fileSizeMB: number, quality: string): number {
    const baseTimePerMB = {
      ultra: 120, // 2 minutes per MB
      high: 60,   // 1 minute per MB  
      medium: 30, // 30 seconds per MB
      low: 15     // 15 seconds per MB
    };
    
    const timePerMB = baseTimePerMB[quality as keyof typeof baseTimePerMB] || 30;
    return Math.round(fileSizeMB * timePerMB);
  }
}