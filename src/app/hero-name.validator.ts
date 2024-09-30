import { AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { DBHeroesService } from './services/dbheroes.service';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, debounceTime, take, catchError } from 'rxjs/operators';

// ...

export function createHeroNameValidator(dbHeroesService: DBHeroesService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const name = control.value;
  
      if (!name) {
        return of(null);
      }
  
      return timer(300)
        .pipe(
          switchMap(() => dbHeroesService.getHeroByName(name)),
          take(1),
          map(hero => (hero ? { exists: true } : null)), 
          catchError(async () => null)
        );
    };
  }
