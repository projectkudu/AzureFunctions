import { QuickstartComponent } from './quickstart.component';
import { StepChooseDevEnvironmentComponent } from './step-choose-dev-environment/step-choose-dev-environment.component';
import { StepCreateFunctionComponent } from './step-create-function/step-create-function.component';
import { StepCreatePortalFunctionComponent } from './step-create-portal-function/step-create-portal-function.component';
import { StepCreateFunctionInstructionsComponent } from './step-create-function-instructions/step-create-function-instructions.component';
import { StepChooseDeploymentMethodComponent } from './step-choose-deployment-method/step-choose-deployment-method.component';
import { SharedModule } from './../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { WizardModule } from 'app/controls/form-wizard/wizard.module';

@NgModule({
    entryComponents: [QuickstartComponent],
    declarations: [
        StepChooseDevEnvironmentComponent,
        StepCreateFunctionComponent,
        StepCreatePortalFunctionComponent,
        StepCreateFunctionInstructionsComponent,
        StepChooseDeploymentMethodComponent,
        QuickstartComponent
    ],
    imports: [TranslateModule.forChild(), SharedModule, WizardModule],
    exports: [QuickstartComponent]
})
export class QuickstartModule {
    static forRoot(): ModuleWithProviders {
        return { ngModule: QuickstartModule, providers: [] };
    }
}
