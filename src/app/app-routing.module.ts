import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostListComponent } from './post/post-list/post-list.component';
import { PostCardComponent } from './post/post-card/post-card.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {path: '', component: PostListComponent},
  {path: 'create', component: PostCardComponent, canActivate: [AuthGuard]},
  {path: 'edit/:postId', component: PostCardComponent},
  {path: 'auth', loadChildren: () => import('./auth/auth.module').then(n => n.AuthModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
