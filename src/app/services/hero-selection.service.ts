import { Injectable } from '@angular/core';
import { Hero } from '../hero';

@Injectable({
  providedIn: 'root'
})
export class HeroSelectionService {
  private selectedHero: Hero | undefined;

  setSelectedHero(hero: Hero | undefined): void {
    this.selectedHero = hero;
  }

  getSelectedHero(): Hero | undefined {
    return this.selectedHero;
  }
}
