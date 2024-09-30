import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { Hero } from '../hero';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero-search',
  templateUrl: './hero-search.component.html',
  styleUrls: ['./hero-search.component.scss']
})
export class HeroSearchComponent implements OnInit {
  searchBox = new FormControl<string | null>(null);
  heroes$!: Observable<Hero[]>;
  public searchBoxFocused = false;

  constructor(private heroService: HeroService) {}

  ngOnInit(): void {
    this.heroes$ = this.searchBox.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((term: string | null) => !!term), 
      switchMap((term: string | null) => this.heroService.searchHeroes(term || ''))
    );
  }

  onSearchFocus(): void {
    this.searchBoxFocused = true;
  }

  onSearchBlur(): void {
    setTimeout(() => {
      this.searchBoxFocused = false;
    }, 200);
  }
}
