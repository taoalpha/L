import { HomeComponent } from './components/home/home.component';
import { SplashComponent } from './components/splash/splash.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NoteComponent } from './components/note/note.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: "home",
    pathMatch: "full",
    // component: SplashComponent
  },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      {
        path: "note/:id",
        component: NoteComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
