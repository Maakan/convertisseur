import { Component, signal } from '@angular/core';
import { TauxDeChangeComponent } from "./components/taux-de-change.component";

@Component({
  selector: 'app-root',
  imports: [ TauxDeChangeComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('convertisseur');
}
