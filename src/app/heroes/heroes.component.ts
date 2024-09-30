import { Component, OnInit } from '@angular/core';
import { Hero } from '../hero';
import { HeroService } from '../hero.service';
import { FormControl } from '@angular/forms'; 
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { PowerRankControlComponent } from '../power-rank-control/power-rank-control.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-heroes',
  standalone: true,
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.scss'],
  imports:[
    PowerRankControlComponent,
    ReactiveFormsModule,
    RouterLink, 
    CommonModule
  ]
})


export class HeroesComponent implements OnInit {
  heroes: Hero[] = [];

  constructor(private heroService: HeroService) {}

  heroes$ = new BehaviorSubject<Hero[]>([]);

  
  filterFormControl = new FormControl('all');
  sortFormControl = new FormControl('id');

  
  filteredAndSortedHeroes$ = combineLatest([
    this.filterFormControl.valueChanges.pipe(startWith('all')), 
    this.sortFormControl.valueChanges.pipe(startWith('id')), 
    this.heroes$
  ]).pipe(
    map(([filter, sort, heroes]) =>
      this.applyFilterAndSort(filter, sort, heroes)
    ));

  ngOnInit(): void {
    this.getHeroes();
  }

  applyFilterAndSort(filter: string | null, sort: string | null, heroes: Hero[]): Hero[] {
    let filteredHeroes = heroes;
  
    if (filter && filter !== 'all') {
      filteredHeroes = filteredHeroes.filter(hero => hero.element === filter);
    }
  
    switch(sort) {
      case 'name':
        filteredHeroes.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'power':
        filteredHeroes.sort((a, b) => a.power_rank - b.power_rank);
        break;
      case 'id':
        filteredHeroes.sort((a, b) => (a.id && b.id) ? a.id - b.id : 0);
        break;
    }
  
    return filteredHeroes;
  }

  getHeroes(): void {
    this.heroService.getHeroes().subscribe(heroes => {
      this.heroes$.next(heroes);
    });
  }

  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    this.heroService.addHero({ name } as Hero)
      .subscribe(hero => {
        const updatedHeroes = [...this.heroes$.value, hero];
        this.heroes$.next(updatedHeroes);
      });
  }

  delete(hero: Hero): void {
    const updatedHeroes = this.heroes$.value.filter(h => h !== hero);
    
    if (hero.id !== undefined) {
      this.heroService.deleteHero(hero.id).subscribe(() => {
        this.heroes$.next(updatedHeroes);
      });
    
    }
  }

  setFilter(event: any) {
    const selectedValue = event.target.value;
    this.filterFormControl.setValue(selectedValue); 
  }
  
  setSort(event: any) {
    const selectedValue = event.target.value;
    this.sortFormControl.setValue(selectedValue); 
  }
}
