import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, ReactiveFormsModule, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Hero } from '../hero'
import { PowerRankControlComponent } from '../power-rank-control/power-rank-control.component';
import { DBHeroesService } from '../services/dbheroes.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-form',
  standalone: true,
  templateUrl: './hero-form.component.html',
  styleUrls: ['./hero-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HeroFormCvaComponent),
      multi: true,
    },
  ],
  imports: [
    ReactiveFormsModule,
    PowerRankControlComponent,
    CommonModule
  ]
})
export class HeroFormCvaComponent implements OnInit, ControlValueAccessor {
  @Input() isEditing: boolean = false;
  @Input() isDisabled: boolean = false;
  @Input() heroData: Hero | undefined;
  @Input() nameControl: FormControl | undefined;
  @Input() powerRankControl: FormControl | undefined;
  @Input() elementControl: FormControl | undefined;
  @Output() powerRankChange = new EventEmitter<number>();

  heroForm: FormGroup;
  inputTouched: boolean = false;

  propagateChange: (hero: Hero | null) => void = () => {};
  propagateTouched: () => void = () => {};
  cd: any;

  constructor(private formBuilder: FormBuilder, private dbHeroesService: DBHeroesService) {
    this.heroForm = this.formBuilder.group({
      id: [null],
      name: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]*$/)],
      ],
      element: ['', Validators.required],
      power_rank: [{ value: 0, disabled: this.isDisabled }, [Validators.required, Validators.min(1)]]

 
    });
    
    this.heroForm.valueChanges.subscribe(() => {
      this.propagateChange(this.heroForm.value);
    });
  }

  ngOnInit(): void {}

  writeValue(hero: Hero | null): void {
    console.log('Here: ', hero);
    if (hero) {
      this.heroForm.setValue({
        id: hero.id || null,
        name: hero.name || '',
        element: hero.element || '',
        power_rank: hero.power_rank || 0,
      });
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.heroForm.disable();
    } else {
      this.heroForm.enable();
    }
     this.cd.markForCheck();
  }

  onBlur(): void {
    this.inputTouched = true;
    this.propagateTouched();
  }

  onSubmit(): void {
    if (this.heroForm.valid) {
      const newHero = this.heroForm.value;
      if (this.isEditing) {
        this.dbHeroesService.updateHero(newHero).subscribe(() => {
          
        });
      } else {
        this.dbHeroesService.addHero(newHero).subscribe(() => {
          
        });
      }
    }
  }

  onPowerRankChange(value: number): void {
    this.heroForm.get('power_rank')?.setValue(value);
  }
}
