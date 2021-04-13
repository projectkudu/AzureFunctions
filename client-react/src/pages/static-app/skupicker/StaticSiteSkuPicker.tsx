import { CommandBar, DefaultButton, IChoiceGroupOption, ICommandBarItemProps, Icon } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RadioButtonNoFormik from '../../../components/form-controls/RadioButtonNoFormik';
import { PortalContext } from '../../../PortalContext';
import { ThemeContext } from '../../../ThemeContext';
import {
  gridBottomSelectedItemStyle,
  gridContainerStyle,
  planFeatureItemStyle,
  selectedGridItemStyle,
  unselectedGridItemStyle,
  radioButtonStyle,
  skuTitleStyle,
  skuDescriptionStyle,
  planFeaturesTitleStyle,
  skuTitleSelectedStyle,
  skuTitleUnselectedStyle,
  iconStyle,
  titleWithPaddingStyle,
  buttonFooterStyle,
  gridContextPaneContainerStyle,
  descriptionStyle,
  smallerTitleWithPaddingStyle,
} from './StaticSiteSkuPicker.styles';
import { getTelemetryInfo } from '../../app/deployment-center/utility/DeploymentCenterUtility';
import { staticSiteSku } from './StaticSiteSkuPicker.types';
import { CommonConstants } from '../../../utils/CommonConstants';
import { CommandBarStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/CommandBar.styles';
import { CustomCommandBarButton } from '../../../components/CustomCommandBarButton';

export interface StaticSiteSkuPickerProps {
  isStaticSiteCreate: boolean;
  currentSku: string;
  resourceId: string;
}

const StaticSiteSkuPicker: React.FC<StaticSiteSkuPickerProps> = props => {
  const { isStaticSiteCreate, currentSku } = props;
  const { t } = useTranslation();

  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);

  const [selectedSku, setSelectedSku] = useState<string>(staticSiteSku.Free);

  const applyButtonOnClick = () => {
    portalContext.log(getTelemetryInfo('verbose', 'applyButton', 'clicked', { selectedSku: selectedSku }));
    portalContext.closeSelf(selectedSku);
  };

  const saveButtonOnClick = () => {
    portalContext.log(getTelemetryInfo('verbose', 'saveButton', 'clicked'));
    //TODO (stpelleg): update static site implementation
  };

  const getSaveButton = (): ICommandBarItemProps => {
    const isSaveDisabled: boolean = currentSku === selectedSku;
    return {
      key: 'save',
      name: t('save'),
      iconProps: {
        iconName: 'Save',
      },
      ariaLabel: t('save'),
      disabled: isSaveDisabled,
      onClick: saveButtonOnClick,
    };
  };

  const getCommandBarItems = (): ICommandBarItemProps[] => {
    return [getSaveButton()];
  };

  const getFreeColumnClassname = (): string => {
    return selectedSku === staticSiteSku.Free ? selectedGridItemStyle(theme) : unselectedGridItemStyle(theme);
  };

  const getStandardColumnClassname = (): string => {
    return selectedSku === staticSiteSku.Standard ? selectedGridItemStyle(theme) : unselectedGridItemStyle(theme);
  };

  const getHeaderRow = (): JSX.Element => {
    return (
      <>
        <div className={planFeaturesTitleStyle(theme)} aria-label={t('staticSitePlanFeaturesAriaLabel')}>
          {t('staticSitePlanFeatures')}
        </div>
        {getSkuTitleSection(staticSiteSku.Free, t('staticSiteFreePlanAriaLabel'), t('staticSiteFree'), t('staticSiteFreeDescription'))}
        {getSkuTitleSection(
          staticSiteSku.Standard,
          t('staticSiteStandardPlanAriaLabel'),
          t('staticSiteStandard'),
          t('staticSiteStandardDescription')
        )}
      </>
    );
  };

  const getPriceRow = (): JSX.Element => {
    return getGridMiddleRow(t('staticSitePrice'), t('staticSiteFree'), t('staticSiteStandardPrice'));
  };

  const getIncludedBandwidthRow = (): JSX.Element => {
    return getGridMiddleRow(
      t('staticSiteIncludedBandwidth'),
      t('staticSiteIncludedBandwidthAmount'),
      t('staticSiteIncludedBandwidthAmount')
    );
  };

  const getBandwidthOverageRow = (): JSX.Element => {
    //TODO (stpelleg): billing meter implementation
    return getGridMiddleRow(t('staticSiteBandwidthOverage'), CommonConstants.Dash, t('staticSiteStandardBandwidthOverageAmount'));
  };

  const getCustomDomainsRow = (): JSX.Element => {
    return getGridMiddleRow(t('staticSiteCustomDomains'), t('staticSiteFreeCustomDomainAmount'), t('staticSiteStandardCustomDomainAmount'));
  };

  const getSslCertificatesRow = (): JSX.Element => {
    return getGridMiddleRow(t('staticSiteSslCertificates'), t('staticSiteFree'), t('staticSiteFree'));
  };

  const getCustomAuthenticationRow = (): JSX.Element => {
    return getGridMiddleRow(
      t('staticSiteCustomAuthentication'),
      CommonConstants.Dash,
      <Icon iconName={'Accept'} className={iconStyle(theme)} />
    );
  };

  const getPrivateLinkRow = (): JSX.Element => {
    return getGridMiddleRow(t('staticSitePrivateLink'), CommonConstants.Dash, <Icon iconName={'Accept'} className={iconStyle(theme)} />);
  };

  const getStorageRow = (): JSX.Element => {
    return getGridMiddleRow(t('staticSiteStorage'), t('staticSiteFreeStorageAmount'), t('staticSiteStandardStorageAmount'));
  };

  const getAzureFunctionsRow = (): JSX.Element => {
    return getGridBottomRow(
      t('staticSiteAzureFunctions'),
      t('staticSiteFreeAzureFunctionsAmount'),
      t('staticSiteStandardAzureFunctionsAmount')
    );
  };

  const getSkuTitleSection = (sku: string, radioButtonAriaLabel: string, skuTitle: string, skuDescription: string): JSX.Element => {
    return (
      <>
        <div className={selectedSku === sku ? skuTitleSelectedStyle(theme) : skuTitleUnselectedStyle(theme)}>
          <div className={radioButtonStyle}>
            <RadioButtonNoFormik
              id="static-site-sku"
              aria-label={radioButtonAriaLabel}
              selectedKey={selectedSku}
              options={[
                {
                  key: sku,
                  text: '',
                },
              ]}
              onChange={(e: any, configOptions: IChoiceGroupOption) => {
                setSelectedSku(configOptions.key);
              }}
            />
          </div>
          <div className={skuTitleStyle} aria-hidden={true}>
            {skuTitle}
          </div>
          <div className={skuDescriptionStyle} aria-hidden={true}>
            {skuDescription}
          </div>
        </div>
      </>
    );
  };

  const getGridMiddleRow = (featureTitle: string, freeSkuValue: string, standardSkuValue: string | JSX.Element): JSX.Element => {
    return (
      <>
        <div className={planFeatureItemStyle(theme)} aria-hidden={true}>
          {featureTitle}
        </div>
        <div className={getFreeColumnClassname()} aria-hidden={true}>
          {freeSkuValue}
        </div>
        <div className={getStandardColumnClassname()} aria-hidden={true}>
          {standardSkuValue}
        </div>
      </>
    );
  };

  const getGridBottomRow = (featureTitle: string, freeSkuValue: string, standardSkuValue: string | JSX.Element): JSX.Element => {
    const isStandardSelected: boolean = selectedSku === staticSiteSku.Standard;
    return (
      <>
        <div className={planFeatureItemStyle(theme)} aria-hidden={true}>
          {featureTitle}
        </div>
        <div className={!isStandardSelected ? gridBottomSelectedItemStyle(theme) : getFreeColumnClassname()} aria-hidden={true}>
          {freeSkuValue}
        </div>
        <div className={isStandardSelected ? gridBottomSelectedItemStyle(theme) : getStandardColumnClassname()} aria-hidden={true}>
          {standardSkuValue}
        </div>
      </>
    );
  };

  const gridRows: JSX.Element[] = [
    getHeaderRow(),
    getPriceRow(),
    getIncludedBandwidthRow(),
    getBandwidthOverageRow(),
    getCustomDomainsRow(),
    getSslCertificatesRow(),
    getCustomAuthenticationRow(),
    getPrivateLinkRow(),
    getStorageRow(),
    getAzureFunctionsRow(),
  ];

  useEffect(() => {
    if (currentSku) {
      setSelectedSku(currentSku);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {!isStaticSiteCreate && (
        <CommandBar
          items={getCommandBarItems()}
          role="nav"
          styles={CommandBarStyles}
          ariaLabel={t('deploymentCenterCommandBarAriaLabel')}
          buttonAs={CustomCommandBarButton}
        />
      )}

      {isStaticSiteCreate && <h2 className={titleWithPaddingStyle}>{t('staticSitePlanComparison')}</h2>}
      {!isStaticSiteCreate && <h3 className={smallerTitleWithPaddingStyle}>{t('staticSiteChoosePlan')}</h3>}

      <div className={descriptionStyle} id="hosting-plan-desc">
        {t('staticSiteHostingPlanDescription')}
      </div>

      <div className={isStaticSiteCreate ? gridContextPaneContainerStyle : gridContainerStyle}>{gridRows}</div>

      {isStaticSiteCreate && (
        <div className={buttonFooterStyle(theme)}>
          <DefaultButton text={t('staticSiteApply')} ariaLabel={t('staticSiteApply')} onClick={applyButtonOnClick} />
        </div>
      )}
    </>
  );
};

export default StaticSiteSkuPicker;
