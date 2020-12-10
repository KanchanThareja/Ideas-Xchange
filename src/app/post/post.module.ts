import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { PostCardComponent } from './post-card/post-card.component';
import { PostListComponent } from './post-list/post-list.component';

@NgModule({
    declarations: [
        PostCardComponent,
        PostListComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MaterialModule,
        RouterModule
    ]
})

export class PostModule {}