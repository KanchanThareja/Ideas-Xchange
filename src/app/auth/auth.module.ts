import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

@NgModule({
    declarations: [
        LoginComponent,
        SignupComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        AuthRoutingModule
    ]
})
export class AuthModule {}