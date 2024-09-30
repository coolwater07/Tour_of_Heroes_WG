import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-power-rank-control',
  standalone: true,
  templateUrl: './power-rank-control.component.html',
  styleUrls: ['./power-rank-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PowerRankControlComponent),
      multi: true,
    },
  ],
    imports: [
    ReactiveFormsModule
  ] 
})
export class PowerRankControlComponent implements ControlValueAccessor, OnInit {
  @Input() disabled = false;
  @Input() value = 0;
  @Output() valueChange = new EventEmitter<number>(); 

  powerRankControl: FormControl = new FormControl(0);

  private onChange: any = () => {};
  private onTouched: any = () => {};

  ngOnInit() {
    this.powerRankControl.valueChanges.subscribe((value) => {
      this.onChange(value);
      this.onTouched();
    });
  }

  writeValue(value: number): void {
    this.powerRankControl.setValue(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  increase(): void {
    if (!this.disabled) {
      const newValue = Math.min(100, this.powerRankControl.value + 5);
      this.powerRankControl.setValue(newValue);
      
    }
  }

  decrease(): void {
    if (!this.disabled) {
      const newValue = Math.max(0, this.powerRankControl.value - 5);
      this.powerRankControl.setValue(newValue);
      
    }
  }
}
