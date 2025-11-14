import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = 'default';

  setTheme(themeName: string): void {
    this.currentTheme = themeName;
    const linkElement = document.getElementById('theme-stylesheet') as HTMLLinkElement;
    
    if (linkElement) {
      linkElement.href = `/styles/themes/${themeName}.css`;
    } else {
      const link = document.createElement('link');
      link.id = 'theme-stylesheet';
      link.rel = 'stylesheet';
      link.href = `/styles/themes/${themeName}.css`;
      document.head.appendChild(link);
    }
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }
}

