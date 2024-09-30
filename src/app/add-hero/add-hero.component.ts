import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Hero } from '../hero';
import { DBHeroesService } from '../services/dbheroes.service';
import { HeroFormCvaComponent } from '../hero-form/hero-form.component';

@Component({
  selector: 'app-add-hero',
  standalone: true,
  templateUrl: './add-hero.component.html',
  styleUrls: ['./add-hero.component.scss'],
  imports: [
    HeroFormCvaComponent
  ]
})
export class AddHeroComponent implements OnInit {
  heroData: Hero = { name: '', element: '', power_rank: 0 }; 

  constructor(private router: Router, private dbHeroesService: DBHeroesService) {}

  ngOnInit(): void {}

  onCreateHero() {
    
  }
}
