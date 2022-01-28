import React, { useContext, useState } from 'react';
import { Pivot, PivotItem, IPivotItemProps } from '@fluentui/react';
import { useTranslation } from 'react-i18next';
import CustomTabRenderer from '../../app/app-settings/Sections/CustomTabRenderer';
import Configuration from './Configuration';
import { PortalContext } from '../../../PortalContext';
import { ThemeContext } from '../../../ThemeContext';
import { ConfigurationPivotProps } from './Configuration.types';
import { getTelemetryInfo } from '../StaticSiteUtility';
import ConfigurationGeneralSettings from './ConfigurationGeneralSettings';

const ConfigurationPivot: React.FC<ConfigurationPivotProps> = props => {
  const { isLoading, hasWritePermissions, formProps } = props;
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = useState<string>('appSettings');

  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);

  const onLinkClick = (item: PivotItem) => {
    if (item.props.itemKey) {
      setSelectedKey(item.props.itemKey);
      const data = {
        tabName: item.props.itemKey,
      };
      portalContext.log(getTelemetryInfo('info', 'tabClicked', 'clicked', data));
    }
  };

  const isAppSettingsDirty = (): boolean => {
    return false;
  };

  const isGeneralSettingsDirty = (): boolean => {
    return false;
  };

  return (
    <Pivot selectedKey={selectedKey} onLinkClick={onLinkClick}>
      <PivotItem
        itemKey="appSettings"
        headerText={t('staticSite_applicationSettings')}
        ariaLabel={t('staticSite_applicationSettings')}
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, isAppSettingsDirty, t('modifiedTag'))
        }>
        <Configuration {...props} />
      </PivotItem>
      <PivotItem
        itemKey="generalSettings"
        headerText={t('staticSite_generalSettings')}
        ariaLabel={t('staticSite_generalSettings')}
        onRenderItemLink={(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element) =>
          CustomTabRenderer(link, defaultRenderer, theme, isGeneralSettingsDirty, t('modifiedTag'))
        }>
        <ConfigurationGeneralSettings disabled={isLoading || !hasWritePermissions} formProps={formProps} />
      </PivotItem>
    </Pivot>
  );
};

export default ConfigurationPivot;
