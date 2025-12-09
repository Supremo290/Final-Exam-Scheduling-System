import { NgModule } from '@angular/core';
import { MatButtonModule, MatToolbarModule } from '@angular/material';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import {MatStepperModule} from '@angular/material/stepper';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatMenuModule} from '@angular/material/menu';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatNativeDateModule} from '@angular/material';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatRadioModule} from '@angular/material/radio';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSortModule} from '@angular/material/sort';
import {MatChipsModule} from '@angular/material/chips';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';


@NgModule({
  imports: [MatButtonModule, MatToolbarModule,MatIconModule,MatCardModule,MatStepperModule,
  MatFormFieldModule,FormsModule, ReactiveFormsModule,MatInputModule,MatSelectModule,
  MatCheckboxModule,MatListModule,MatGridListModule,MatSidenavModule,MatExpansionModule,
  MatMenuModule,MatTabsModule,MatDialogModule,MatProgressSpinnerModule,MatDatepickerModule,
   MatTableModule,MatPaginatorModule,MatNativeDateModule,MatSlideToggleModule,MatRadioModule,
   MatAutocompleteModule,MatProgressBarModule,
   DragDropModule,MatSortModule,MatTooltipModule,MatButtonToggleModule, MatChipsModule

  ],
  exports: [MatButtonModule, MatToolbarModule,MatIconModule,MatCardModule,MatStepperModule,
  MatFormFieldModule,FormsModule, ReactiveFormsModule,MatInputModule,MatSelectModule,
  MatCheckboxModule,MatListModule,MatGridListModule,MatSidenavModule,MatExpansionModule,
  MatMenuModule,MatTabsModule,MatDialogModule,MatProgressSpinnerModule,MatDatepickerModule,
  MatTableModule,MatPaginatorModule,MatNativeDateModule,MatSlideToggleModule,MatRadioModule,
  MatAutocompleteModule,MatProgressBarModule,
  DragDropModule,MatSortModule,MatTooltipModule,MatButtonToggleModule, MatChipsModule,
  CdkTableModule,
  CdkTreeModule,
  ],
})
export class MaterialModule { }
