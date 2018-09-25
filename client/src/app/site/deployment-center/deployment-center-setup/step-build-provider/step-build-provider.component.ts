import { Component, OnDestroy } from '@angular/core';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { ProviderCard } from '../../Models/provider-card';
import { ScenarioIds } from '../../../../shared/models/constants';
import { from } from 'rxjs/observable/from';
import { ScenarioService } from '../../../../shared/services/scenario/scenario.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { of } from 'rxjs/observable/of';
import { Subject } from 'rxjs/Subject';
@Component({
    selector: 'app-step-build-provider',
    templateUrl: './step-build-provider.component.html',
    styleUrls: ['./step-build-provider.component.scss', '../deployment-center-setup.component.scss'],
})
export class StepBuildProviderComponent implements OnDestroy {

    public readonly providerCards: ProviderCard[] = [
        {
            id: 'kudu',
            name: this._translateService.instant(PortalResources.kuduTitle),
            icon: 'image/deployment-center/kudu.svg',
            color: '#000000',
            description: this._translateService.instant(PortalResources.kuduDesc),
            authorizedStatus: 'none',
            enabled: true,
        },
        {
            id: 'vsts',
            name: `${this._translateService.instant(PortalResources.vstsBuildServerTitle)}(${this._translateService.instant(PortalResources.preview)})`,
            icon: 'image/deployment-center/vsts.svg',
            color: '#2B79DA',
            description: this._translateService.instant(PortalResources.vstsBuildServerDesc),
            authorizedStatus: 'none',
            enabled: false,
            scenarioId: ScenarioIds.vstsDeploymentPermission,
        },
    ];

    private _vstsKuduSourceScenarioBlocked = false;
    private _currentSourceControlProvider: string;
    private _ngUnsubscribe = new Subject();
    constructor(
        public wizard: DeploymentCenterStateManager,
        private _translateService: TranslateService,
        private _scenarioService: ScenarioService) {

        // runs scenario checker for each provider to determine if it should be enabled or not
        // if not enabled then it pulls error message from scenario checker
        wizard.siteArmObj$
            .concatMap(siteObj => {
                return from(this.providerCards).switchMap((provider: ProviderCard) => {
                    if (provider.scenarioId) {
                        return forkJoin(of(provider), this._scenarioService.checkScenarioAsync(provider.scenarioId, { site: siteObj }));
                    } else {
                        return of([null, null]);
                    }
                });
            })
            .subscribe(([provider, scenarioCheck]) => {
                if (provider) {
                    provider.enabled = scenarioCheck.status !== 'disabled';
                    provider.errorMessage = scenarioCheck.data && scenarioCheck.data.errorMessage;
                }
            });

        this.wizard.wizardForm.controls.sourceProvider.valueChanges.takeUntil(this._ngUnsubscribe).subscribe((provider) => {
            if (provider !== this._currentSourceControlProvider) {
                this._currentSourceControlProvider = provider;
                const kuduCard = this.providerCards.find(x => x.id === 'kudu');
                if (provider === 'vsts' && this._vstsKuduSourceScenarioBlocked) {
                    this.chooseBuildProvider({ id: 'vsts', enabled: true } as ProviderCard);
                    kuduCard.hidden = true;
                } else {
                    this.chooseBuildProvider({ id: 'kudu', enabled: true } as ProviderCard);
                    kuduCard.hidden = false;
                }
            }
        });
        // this says if kudu should be hidden then default to vsts instead
        wizard.siteArmObj$
            .map(siteObj => {
                return this._scenarioService.checkScenario(ScenarioIds.vstsKuduSource, { site: siteObj });
            })
            .subscribe(result => {
                this._vstsKuduSourceScenarioBlocked = result.status === 'disabled';
            });
    }

    ngOnDestroy(): void {
        this._ngUnsubscribe.next();
    }

    chooseBuildProvider(card: ProviderCard) {
        if (card.enabled) {
            const currentFormValues = this.wizard.wizardValues;
            currentFormValues.buildProvider = card.id;
            this.wizard.wizardValues = currentFormValues;
        }
    }
}
