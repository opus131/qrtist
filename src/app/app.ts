import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-8 font-sans">
      <div class="max-w-4xl w-full flex flex-col md:flex-row gap-12 items-center justify-center">
        
        <div class="flex-1 flex flex-col gap-6 w-full max-w-md">
          <div>
            <h1 class="text-4xl font-bold mb-2 text-white"><span class="text-[#ff3333]">QR</span>TIST</h1>
            <p class="text-neutral-400">Generate beautiful, custom-branded QR codes.</p>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">URL to encode</label>
              <input 
                type="text" 
                [(ngModel)]="url"
                (ngModelChange)="generateQR()"
                class="w-full bg-black/50 border border-[#ff3333]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ff3333] focus:ring-1 focus:ring-[#ff3333] transition-colors"
                placeholder="https://..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">Custom Background Image</label>
              <input 
                type="file" 
                accept="image/*"
                (change)="onImageUpload($event)"
                class="w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ff3333]/20 file:text-[#ff3333] hover:file:bg-[#ff3333]/30 cursor-pointer"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-neutral-300 mb-2">QR Dot Color</label>
              <div class="flex items-center gap-3">
                <input 
                  type="color" 
                  [(ngModel)]="dotColor"
                  (ngModelChange)="generateQR()"
                  class="h-10 w-20 rounded cursor-pointer bg-black/50 border border-[#ff3333]/30 p-1"
                />
                <span class="text-sm text-neutral-400">{{ dotColor }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-300 mb-2">BG Opacity: {{bgOpacity}}%</label>
                <input
                  type="range"
                  min="0" max="100"
                  [(ngModel)]="bgOpacity"
                  (ngModelChange)="generateQR()"
                  class="w-full accent-[#ff3333]"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-300 mb-2">Dot Opacity: {{dotOpacity}}%</label>
                <input 
                  type="range" 
                  min="10" max="100" 
                  [(ngModel)]="dotOpacity"
                  (ngModelChange)="generateQR()"
                  class="w-full accent-[#ff3333]"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-300 mb-2">Blend Mode</label>
                <select 
                  [(ngModel)]="blendMode"
                  (ngModelChange)="generateQR()"
                  class="w-full bg-black/50 border border-[#ff3333]/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#ff3333] text-sm"
                >
                  <option value="source-over">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                  <option value="difference">Difference</option>
                  <option value="exclusion">Exclusion</option>
                </select>
              </div>
            </div>
            
            <button 
              (click)="download()"
              class="w-full bg-[#ff3333] hover:bg-[#e62e2e] text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#ff3333]/20 mt-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download QR Code
            </button>
          </div>
        </div>

        <div class="relative group">
          <div class="absolute -inset-1 bg-gradient-to-r from-[#ff3333] to-[#8b0000] rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <canvas 
            #qrCanvas 
            class="relative w-[400px] h-[400px] rounded-2xl shadow-2xl bg-neutral-900"
          ></canvas>
        </div>

      </div>
    </div>
  `,
})
export class App implements AfterViewInit {
  @ViewChild('qrCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  url = 'https://your-website.com';
  dotColor = '#ffffff';
  bgOpacity = 100;
  dotOpacity = 100;
  blendMode = 'source-over';
  bgImage: HTMLImageElement | null = null;
  
  ngAfterViewInit() {
    // Small delay to ensure canvas is ready
    setTimeout(() => this.generateQR(), 0);
  }

  onImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          this.bgImage = img;
          if (this.dotColor === '#ffffff') {
            this.dotColor = '#2d0a0a'; // Auto-switch to dark dots for uploaded images
          }
          this.generateQR();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  
  generateQR() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    try {
      // Generate QR code data
      const qr = QRCode.create(this.url || 'https://example.com', { errorCorrectionLevel: 'H' });
      const size = qr.modules.size;
      const data = qr.modules.data;
      
      // Set canvas size (high resolution for download)
      const cellSize = 24;
      const margin = 2; // 2 cells margin
      const totalSize = size + 2 * margin;
      canvas.width = totalSize * cellSize;
      canvas.height = totalSize * cellSize;
      
      // 1. Draw Background
      if (this.bgImage) {
        ctx.fillStyle = '#fcf8f2';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const scale = Math.max(canvas.width / this.bgImage.width, canvas.height / this.bgImage.height);
        const x = (canvas.width / 2) - (this.bgImage.width / 2) * scale;
        const y = (canvas.height / 2) - (this.bgImage.height / 2) * scale;
        ctx.globalAlpha = this.bgOpacity / 100;
        ctx.drawImage(this.bgImage, x, y, this.bgImage.width * scale, this.bgImage.height * scale);
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // 4. Create Offscreen Canvas for QR Code
      const offscreen = document.createElement('canvas');
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const octx = offscreen.getContext('2d');
      if (!octx) return;
      
      octx.fillStyle = this.dotColor;
      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          // Skip finder patterns (7x7 squares at corners)
          const isTopLeft = row < 7 && col < 7;
          const isTopRight = row < 7 && col >= size - 7;
          const isBottomLeft = row >= size - 7 && col < 7;
          
          if (isTopLeft || isTopRight || isBottomLeft) continue;
          
          const isDark = data[row * size + col];
          if (isDark) {
            const x = (col + margin) * cellSize;
            const y = (row + margin) * cellSize;
            
            octx.beginPath();
            octx.arc(x + cellSize/2, y + cellSize/2, cellSize * 0.35, 0, Math.PI * 2);
            octx.fill();
          }
        }
      }
      
      // 5. Draw Finder Patterns on Offscreen Canvas
      const drawFinder = (col: number, row: number) => {
        const x = (col + margin) * cellSize;
        const y = (row + margin) * cellSize;
        const fSize = 7 * cellSize;
        const radius = cellSize * 1.5;
        
        // Outer
        octx.globalCompositeOperation = 'source-over';
        octx.fillStyle = this.dotColor;
        octx.beginPath();
        octx.roundRect(x, y, fSize, fSize, radius);
        octx.fill();
        
        // Inner (Cutout to show background)
        octx.globalCompositeOperation = 'destination-out';
        octx.beginPath();
        octx.roundRect(x + cellSize, y + cellSize, fSize - 2 * cellSize, fSize - 2 * cellSize, radius * 0.7);
        octx.fill();
        
        // Center
        octx.globalCompositeOperation = 'source-over';
        octx.fillStyle = this.dotColor;
        octx.beginPath();
        octx.roundRect(x + 2 * cellSize, y + 2 * cellSize, fSize - 4 * cellSize, fSize - 4 * cellSize, radius * 0.4);
        octx.fill();
      };
      
      drawFinder(0, 0); // Top-left
      drawFinder(size - 7, 0); // Top-right
      drawFinder(0, size - 7); // Bottom-left
      
      // 6. Draw Offscreen Canvas to Main Canvas with Blend Mode & Opacity
      ctx.save();
      ctx.globalAlpha = this.dotOpacity / 100;
      ctx.globalCompositeOperation = this.blendMode as GlobalCompositeOperation;
      ctx.drawImage(offscreen, 0, 0);
      ctx.restore();
      
    } catch (err) {
      console.error('Error generating QR code', err);
    }
  }
  
  download() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-art-qrcode.png';
    a.click();
  }
}
