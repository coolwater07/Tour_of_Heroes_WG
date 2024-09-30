import { Component, OnDestroy, OnInit } from '@angular/core';
import { Hero } from '../hero';
import { HeroService } from '../hero.service';
import { ViewMode } from '../view-mode.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  viewMode: ViewMode = ViewMode.List;
  viewModeEnum = ViewMode;
  heroes: Hero[] = [];
  currentPage = 1;
  pageSize = 8;
  pageNumbers: number[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private heroService: HeroService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  heroes$ = new BehaviorSubject<Hero[]>([]);
  sort$ = new BehaviorSubject<string>('id');
  filter$ = new BehaviorSubject<string>('all');
  currentPage$ = new BehaviorSubject<number>(this.currentPage);

  sortControl = new FormControl('id');
  filterControl = new FormControl('all');

  displayedHeroes$ = combineLatest([
    this.heroes$,
    this.filter$,
    this.sort$,
    this.currentPage$,
  ]).pipe(
    map(([heroes, filter, sort, currentPage]) => {
      console.log('Filter:', filter);
      console.log('Sort:', sort);

      let displayedHeroes = heroes;

      if (filter !== 'all') {
        displayedHeroes = displayedHeroes.filter(hero => hero.element === filter);
      }

      if (sort === 'name') {
        displayedHeroes.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === 'power') {
        displayedHeroes.sort((a, b) => a.power_rank - b.power_rank);
      } else if (sort === 'id') {
        displayedHeroes.sort((a, b) => (a.id && b.id) ? a.id - b.id : 0);

      }

      this.calculatePageNumbers(displayedHeroes);

      const startIndex = (currentPage-1) * this.pageSize;
      console.log('startIndex:', startIndex)
      const endIndex = startIndex + this.pageSize;
      console.log('endtIndex:', startIndex)

      console.log('Heroes list:', displayedHeroes.slice)
      return displayedHeroes.slice(startIndex, endIndex);
    })
  );

  ngOnInit(): void {
    this.getHeroes();

    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(queryParams => {
        const filterValue = queryParams.get('filter');
        const sortValue = queryParams.get('sort');

        if (sortValue !== null) {
          this.sortControl.setValue(sortValue);
          this.sort$.next(sortValue);
        }

        if (filterValue !== null) {
          this.filterControl.setValue(filterValue);
          this.filter$.next(filterValue);
        }
      });

    this.sortControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((sortValue) => {
      this.sort$.next(sortValue as string);
      this.updateQueryParams();
    });

    this.filterControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((filterValue) => {
      this.filter$.next(filterValue as string);
      this.updateQueryParams();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getHeroes(): void {
    this.heroService.getHeroes().subscribe(heroes => {
      this.heroes$.next(heroes);
      this.calculatePageNumbers(heroes);
    });
  }

  changeView(mode: ViewMode): void {
    this.viewMode = mode;
  }

  goToPage(page: number): void {
    console.log('Current Page:', page); 
    console.log('total Page:', this.totalPages); 
    if (page >= 1 && page <= this.totalPages) {
      console.log('Current Page 222:', page);
      this.currentPage$.next(page);
    }
  }

  calculatePageNumbers(heroes: Hero[]): void {
    if (heroes.length > 0) {
      const totalPageCount = Math.ceil(heroes.length / this.pageSize);
      console.log('Total Pages:', totalPageCount);
      this.pageNumbers = Array.from(
        { length: totalPageCount },
        (_, index) => index + 1
      );
    }
  }

  get totalPages(): number {
    return Math.ceil(this.heroes.length / this.pageSize);
  }

  private updateQueryParams(): void {
    const queryParams = {
      filter: this.filterControl.value,
      sort: this.sortControl.value
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
