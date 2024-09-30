import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { HeroService } from '../hero.service';
import { Hero } from '../hero';
import { HeroFormCvaComponent } from '../hero-form/hero-form.component';

@Component({
  selector: 'app-hero-detail',
  standalone: true,
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.scss'],
  imports: [
    ReactiveFormsModule,
    HeroFormCvaComponent,
    CommonModule
  ]
})
export class HeroDetailComponent implements OnInit {
  hero: Hero | undefined;
  heroForm: FormGroup;
  elements = ['earth', 'water', 'air', 'ground'];
  nameControl = new FormControl('');
  powerRankControl = new FormControl('0');
  elementControl = new FormControl('');

  constructor(
    private route: ActivatedRoute,
    private heroService: HeroService,
    private location: Location,
    private formBuilder: FormBuilder,
    
  ) {
    this.heroForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z\s.]*$/)]],
      powerRank: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      element: [null],
      power_rank: new FormControl(null) 
    });
  }

  save(): void {
    if (this.heroForm.valid && this.hero) {
      this.hero.name = this.heroForm?.get('name')?.value;
      this.hero.power_rank = this.heroForm?.get('powerRank')?.value;
      this.hero.element = this.heroForm?.get('element')?.value;
      this.heroService.updateHero(this.hero).subscribe(() => this.goBack());
    }
  }

  ngOnInit(): void {
    this.getHero();
  }

  getHero(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.heroService.getHero(id).subscribe(hero => {
      this.hero = hero;
      this.heroForm.setValue({
        name: hero.name || null,
        powerRank: hero.power_rank  || null,
        element: hero.element  || null,
      });
    });
  }

  goBack(): void {
    this.location.back();
  }

  selectElement(element: string): void {
    if (this.hero) {
      this.hero.element = element;
    }
  }

  onPowerRankChange(value: number): void {
    if (this.heroForm.get('power_rank')) {
      this.heroForm.get('power_rank')?.setValue(value);
    }
  }
}
