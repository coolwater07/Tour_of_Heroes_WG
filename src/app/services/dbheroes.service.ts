import { Injectable } from '@angular/core';
import { Hero } from '../hero';
import { HeroService } from '../hero.service';

import { EMPTY, Observable, from, of, throwError } from 'rxjs';
import { MessageService } from '../message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class DBHeroesService extends HeroService {
  
  private heroesRef: AngularFirestoreCollection<Hero>;
  private maxId = 0;

  constructor (
    protected override http: HttpClient,
    protected override messageService: MessageService,
    private firestore: AngularFirestore 
    ) { 
    super(http, messageService)
    this.heroesRef = this.firestore.collection<Hero>('heroes');
    this.updateMaxId();
  }
  private updateMaxId() {
    this.getHeroes().subscribe(heroes => {
      this.maxId = heroes.reduce((prevMax, current) => (current.id ? (current.id > prevMax ? current.id : prevMax) : prevMax), 0);
    });
  }
  

  /** GET heroes from the server */
  
  override getHeroes(): Observable<Hero[]> {
    return this.heroesRef.valueChanges()
      .pipe(
        map(heroes => heroes.map(hero => ({ ...hero }))),
        tap(_ => this.log('fetched heroes')),
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );
  }

  /** GET hero by id. Return `undefined` when id not found */
  override getHeroNo404<Data>(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/?id=${id}`;
    return this.http.get<Hero[]>(url)
      .pipe(
        map(heroes => heroes[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? 'fetched' : 'did not find';
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  /** GET hero by id. Will 404 if id not found */
  override getHero(id: number): Observable<Hero> {
    const docRef = this.heroesRef.doc<Hero>(id.toString());
  
    return docRef.valueChanges().pipe(
      filter((hero: any) => !!hero),
      tap(hero => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`)),
      take(1)
    );
  }

  /* GET heroes whose name contains search term */
  override searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      return of([]);
    }
  
    return this.heroesRef.valueChanges().pipe(
      map(heroes => heroes.filter(hero => hero.name.toLowerCase().includes(term.toLowerCase()))),
      tap(heroes => {
        heroes.length ?
          this.log(`found heroes matching "${term}"`) :
          this.log(`no heroes matching "${term}"`);
      }),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }
  
  getHeroByName(name: string): Observable<Hero | undefined> {
    return this.heroesRef.valueChanges().pipe(
      map(heroes => heroes.find(hero => hero.name === name))
    );
  }
  
  /** Log a HeroService message with the MessageService */
  protected override log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }

  protected override heroesUrl = 'api/heroes';  // URL to web api
  /**
 * Handle Http operation that failed.
 * Let the app continue.
 *
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 */
  protected override handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
  /** PUT: update the hero on the server */
  override updateHero(hero: Hero): Observable<any> {
    if (!hero || !hero.id) {
      return EMPTY;
    }
  
    const docRef = this.heroesRef.doc<Hero>(hero.id.toString());
    return from(docRef.update(hero)).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  /** POST: add a new hero to the server */
  override addHero(hero: Hero): Observable<Hero> {
    if (!hero || !hero.name) {
      return EMPTY;
    }
    this.maxId++;
    hero.id = this.maxId;

    const docRef = this.heroesRef.doc<Hero>(hero.id.toString());
    return from(docRef.set(hero)).pipe(
      map(() => hero),
      tap(() => this.log(`added hero w/ id=${hero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  

  /** DELETE: delete the hero from the server */
  override deleteHero(id: number): Observable<Hero> {
    const docRef = this.heroesRef.doc<Hero>(id.toString());
    return this.getHero(id).pipe(
      switchMap((hero: Hero | undefined) => {
        if (hero) {
          return from(docRef.delete()).pipe(
            map(() => hero), 
            tap(_ => this.log(`deleted hero id=${id}`)),
            catchError(this.handleError<Hero>('deleteHero'))
          );
        } else {
          
          return throwError(`Hero with id=${id} not found`);
        }
      }),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }


}
