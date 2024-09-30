import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Hero } from '../hero';
import { HeroService } from '../hero.service';
import { HeroSelectionService } from '../services/hero-selection.service';
import { Observable, Subject, map, switchMap, takeUntil } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.scss']
})
export class MatchComponent implements OnInit, OnDestroy {
  selectedHero: Hero | undefined;
  heroes: Hero[] = [];
  heroesThatCanWin$: Observable<Hero[]> | undefined;
  heroesThatCanLose$: Observable<Hero[]> | undefined;
  selectedHeroControl = new FormControl('');
  private destroy$ = new Subject<void>();


  constructor(
    private router: Router,
    private heroService: HeroService,
    private heroSelectionService: HeroSelectionService
  ) {}

  ngOnInit(): void {
    this.getHeroes();
    this.selectedHero = this.heroSelectionService.getSelectedHero();
    this.updateFilteredHeroes();

    this.selectedHeroControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((sortValue) => {
      const heroId = this.selectedHeroControl.value;
      console.log('Selected hero', this.selectedHeroControl.value )
      if (heroId) {
        const selectedHero = this.heroes.find(hero => hero.id === +heroId);
        if (selectedHero) {
          this.selectedHero = selectedHero;
          this.heroSelectionService.setSelectedHero(selectedHero);
          this.updateFilteredHeroes();
        }
      }
    });
  }

  getHeroes(): void {
    this.heroService.getHeroes().subscribe(heroes => {
      this.heroes = heroes;
      console.log('Heroes', this.heroes )
    });
  }

  /* onHeroSelect(): void {
    const heroId = this.selectedHeroControl.value;
    console.log('Selected hero', this.selectedHeroControl.value )
    if (heroId) {
      const selectedHero = this.heroes.find(hero => hero.id === +heroId);
      if (selectedHero) {
        this.selectedHero = selectedHero;
        this.heroSelectionService.setSelectedHero(selectedHero);
        this.updateFilteredHeroes();
      }
    }
  } */

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateFilteredHeroes(): void {
    if (this.selectedHero) {
      this.heroesThatCanWin$ = this.heroService.getHeroes().pipe(
        switchMap(heroes =>
          this.heroService.getHeroes().pipe(
            map(allHeroes => allHeroes.filter(hero => hero.power_rank < this.selectedHero!.power_rank))
          )
        )
      );
      this.heroesThatCanLose$ = this.heroService.getHeroes().pipe(
        switchMap(heroes =>
          this.heroService.getHeroes().pipe(
            map(allHeroes => allHeroes.filter(hero => hero.power_rank > this.selectedHero!.power_rank))
          )
        )
      );
    } else {
      this.heroesThatCanWin$ = new Observable<Hero[]>(observer => observer.next([]));
      this.heroesThatCanLose$ = new Observable<Hero[]>(observer => observer.next([]));
    }
  }
}


