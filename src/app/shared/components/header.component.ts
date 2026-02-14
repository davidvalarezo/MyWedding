import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="py-12 px-4 text-center border-b border-gold/20 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <h1 class="text-4xl md:text-6xl text-gold mb-2 tracking-widest italic">
        David & Maria
      </h1>
      <div class="flex items-center justify-center gap-4 text-slate-500 font-light tracking-[0.2em] uppercase text-xs md:text-sm">
        <span class="w-12 h-[1px] bg-gold/30"></span>
        <span>19 de Septiembre, 2026</span>
        <span class="w-12 h-[1px] bg-gold/30"></span>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HeaderComponent { }
