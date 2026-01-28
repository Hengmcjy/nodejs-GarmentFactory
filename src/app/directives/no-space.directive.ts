import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNoSpace]'
})
export class NoSpaceDirective {

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 32) {
      event.preventDefault();
    }
  }

}
