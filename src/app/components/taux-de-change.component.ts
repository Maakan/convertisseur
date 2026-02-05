import { DecimalPipe, DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';

interface ConversionHistorique {
  tauxReel: number;
  tauxSaisi: number | null;
  valeurInitiale: number;
  deviseInitiale: 'EUR' | 'USD';
  valeurCalculee: number;
  deviseCalculee: 'EUR' | 'USD';
  date: Date;
}

@Component({
  selector: 'app-exchange-rate',
  imports: [FormsModule, DecimalPipe, DatePipe],
  templateUrl: './taux-de-change.html',
})
export class TauxDeChangeComponent implements OnInit, OnDestroy {
  tauxDeChange = signal<number>(1.1);
  montant = signal<number>(0);
  conversionMode = signal<'EUR' | 'USD'>('EUR');
  tauxModifie = signal<boolean>(false);
  nouveauTaux = signal<number>(1.1);
  ancienTaux = signal<number>(1.1);
  
  historiques = signal<ConversionHistorique[]>([]);
  
  private subscription?: Subscription;

  montantConvertit = computed(() => {
    if (this.conversionMode() === 'EUR') {
      // EUR vers USD
      return this.montant() * this.tauxDeChange();
    } else {
      // USD vers EUR
      return this.montant() / this.tauxDeChange();
    }
  });

  ngOnInit(): void {
    this.subscription = interval(3000).subscribe(() => {
      this.updateTauxDeChange();
    });
  }

  updateTauxDeChange(): void {
    const randomChange = (Math.random() * 0.1) - 0.05;
    
    if (this.tauxModifie()) {
      const newValue = this.ancienTaux() + randomChange;
      this.ancienTaux.set(Math.round(newValue * 10000) / 10000);
    } else {
      const newValue = this.tauxDeChange() + randomChange;
      this.tauxDeChange.set(Math.round(newValue * 10000) / 10000);
      this.ancienTaux.set(this.tauxDeChange());
    }
  }

  changerDevise(): void {
    const montantConvertitPrecedent = this.montantConvertit();
    this.conversionMode.set(this.conversionMode() === 'EUR' ? 'USD' : 'EUR');
    this.montant.set(montantConvertitPrecedent);
  }

  onModificationTaux(): void {
    if (this.tauxModifie()) {
      this.tauxDeChange.set(this.nouveauTaux());
    } else {
      this.tauxDeChange.set(this.ancienTaux());
    }
  }

  enregistrerConversion(): void {
    const montantActuel = this.montant();
    const montantConverti = this.montantConvertit();
    
    // Enregistrer uniquement si le montant est supérieur à 0
    if (montantActuel > 0) {
      const nouvelleEntree: ConversionHistorique = {
        tauxReel: this.ancienTaux(),
        tauxSaisi: this.tauxModifie() ? this.nouveauTaux() : null,
        valeurInitiale: montantActuel,
        deviseInitiale: this.conversionMode(),
        valeurCalculee: montantConverti,
        deviseCalculee: this.conversionMode() === 'EUR' ? 'USD' : 'EUR',
        date: new Date()
      };

      const historiqueActuel = this.historiques();
      const nouvelHistorique = [nouvelleEntree, ...historiqueActuel].slice(0, 5);
      this.historiques.set(nouvelHistorique);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}