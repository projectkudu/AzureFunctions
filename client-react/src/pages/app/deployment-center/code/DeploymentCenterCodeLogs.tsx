import React, { useState, useContext, useMemo } from 'react';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';
import moment from 'moment';
import {
  DeploymentCenterCodeLogsProps,
  DateTimeObj,
  DeploymentStatus,
  DeploymentProperties,
  CodeDeploymentsRow,
} from '../DeploymentCenter.types';
import { ProgressIndicator, PanelType, IColumn, Link, PrimaryButton, IGroup, Selection, SelectionMode } from '@fluentui/react';
import { useTranslation } from 'react-i18next';
import { deploymentCenterLogsError, deploymentCenterCodeLogsNotConfigured, deploymentCenterCodeLogsBox } from '../DeploymentCenter.styles';
import { ArmObj } from '../../../../models/arm-obj';
import CustomPanel from '../../../../components/CustomPanel/CustomPanel';
import DeploymentCenterCommitLogs from './DeploymentCenterCommitLogs';
import DeploymentCenterCodeLogsTimer from './DeploymentCenterCodeLogsTimer';
import { ReactComponent as DeploymentCenterIcon } from '../../../../images/Common/deployment-center.svg';
import { ScmType } from '../../../../models/site/config';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import DeploymentCenterData from '../DeploymentCenter.data';
import ConfirmDialog from '../../../../components/ConfirmDialog/ConfirmDialog';
import { PortalContext } from '../../../../PortalContext';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';

export function dateTimeComparatorReverse(a: DateTimeObj, b: DateTimeObj) {
  if (a.rawTime.isBefore(b.rawTime)) {
    return 1;
  }
  if (a.rawTime.isAfter(b.rawTime)) {
    return -1;
  }
  return 0;
}

const DeploymentCenterCodeLogs: React.FC<DeploymentCenterCodeLogsProps> = props => {
  const [isLogPanelOpen, setIsLogPanelOpen] = useState<boolean>(false);
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = React.useState<boolean>(false);
  const [currentCommitId, setCurrentCommitId] = useState<string | undefined>(undefined);
  const portalContext = useContext(PortalContext);
  const deploymentCenterContext = useContext(DeploymentCenterContext);
  const deploymentCenterData = new DeploymentCenterData();
  const { deployments, deploymentsError, isLogsDataRefreshing, goToSettings, refreshLogs } = props;
  const { t } = useTranslation();
  const [selectedLogs, setSelectedLogs] = React.useState<CodeDeploymentsRow[]>([]);
  const selection = useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {
          const selectedItems = selection.getSelection();
          setSelectedLogs(selectedItems as CodeDeploymentsRow[]);
        },
      }),
    [setSelectedLogs]
  );

  const showLogPanel = (deployment: ArmObj<DeploymentProperties>) => {
    setIsLogPanelOpen(true);
    setCurrentCommitId(deployment.id);
  };
  const dismissLogPanel = () => {
    setIsLogPanelOpen(false);
    setCurrentCommitId(undefined);
  };

  const showDeleteConfirmDialog = () => {
    setIsDeleteConfirmDialogOpen(true);
  };

  const dismissDeleteConfirmDialog = () => {
    setIsDeleteConfirmDialogOpen(false);
  };

  const getStatusString = (status: DeploymentStatus, progressString: string) => {
    switch (status) {
      case DeploymentStatus.Building:
      case DeploymentStatus.Deploying:
        return progressString;
      case DeploymentStatus.Pending:
        return t('pending');
      case DeploymentStatus.Failed:
        return t('failed');
      case DeploymentStatus.Success:
        return t('success');
      default:
        return '';
    }
  };

  const getZipDeployMessage = (message: string) => {
    try {
      const parsed = JSON.parse(message);
      return parsed.commitMessage;
    } catch (e) {
      return message;
    }
  };

  const getDeploymentRow = (deployment: ArmObj<DeploymentProperties>, index: number): CodeDeploymentsRow => {
    return {
      index: index,
      id: deployment.properties.id,
      rawTime: moment(deployment.properties.received_time),
      // NOTE (t-kakan): A is AM/PM and Z is offset from GMT: -07:00 -06:00 ... +06:00 +07:00
      displayTime: moment(deployment.properties.received_time).format('h:mm:ss A Z'),
      commit: (
        <Link href={`#${deployment.properties.id}`} onClick={() => showLogPanel(deployment)}>
          {deployment.properties.id.substr(0, 7)}
        </Link>
      ),
      author: deployment.properties.author,
      message: getZipDeployMessage(deployment.properties.message) || deployment.properties.message,
      status: deployment.properties.active
        ? `${getStatusString(deployment.properties.status, deployment.properties.progress)} (${t('active')})`
        : `${getStatusString(deployment.properties.status, deployment.properties.progress)}`,
    };
  };

  const getItemGroups = (items: CodeDeploymentsRow[]): IGroup[] => {
    const groups: IGroup[] = [];
    items.forEach((item, index) => {
      if (index === 0 || !item.rawTime.isSame(groups[groups.length - 1].data.startIndexRawTime, 'day')) {
        const group = {
          key: `Group${groups.length}`,
          name: item.rawTime.format('dddd, MMMM D, YYYY'),
          startIndex: index,
          count: 1,
          data: { startIndexRawTime: item.rawTime },
        };
        groups.push(group);
      } else {
        groups[groups.length - 1].count += 1;
      }
    });
    return groups;
  };

  const getProgressIndicator = () => {
    return (
      <ProgressIndicator
        description={t('deploymentCenterCodeDeploymentsLoading')}
        ariaValueText={t('deploymentCenterCodeDeploymentsLoadingAriaValue')}
      />
    );
  };

  const goToSettingsOnClick = () => {
    if (goToSettings) {
      goToSettings();
    }
  };

  const deleteLogs = () => {
    const result = {
      error: '',
      isSuccess: true,
    };
    const notificationId = portalContext.startNotification(t('disconnectingDeployment'), t('disconnectingDeployment'));
    portalContext.log(
      getTelemetryInfo('info', 'deletingKuduLogs', 'submit', {
        publishType: 'code',
      })
    );
    selectedLogs.forEach(async log => {
      const response = await deploymentCenterData.deleteSiteDeployment(log.id);
      if (!response.metadata.success) {
        const errorMessage = getErrorMessage(response.metadata.error);
        const message = errorMessage
          ? t('deploymentCenterDeleteLogsFailureWithErrorNotificationDescription').format(errorMessage)
          : t('deploymentCenterDeleteLogsFailureNotificationDescription');
        result.error = message;
        result.isSuccess = false;
      }
    });

    if (result.isSuccess) {
      portalContext.stopNotification(notificationId, true, t('deploymentCenterDeleteLogsSuccessNotificationDescription'));
    } else {
      portalContext.stopNotification(notificationId, false, result.error);
      portalContext.log(
        getTelemetryInfo('error', 'deleteLogs', 'failed', {
          message: result.error,
        })
      );
    }
  };

  const rows: CodeDeploymentsRow[] = deployments ? deployments.value.map((deployment, index) => getDeploymentRow(deployment, index)) : [];
  const items: CodeDeploymentsRow[] = rows.sort(dateTimeComparatorReverse);

  const columns: IColumn[] = [
    { key: 'displayTime', name: t('time'), fieldName: 'displayTime', minWidth: 75, maxWidth: 150 },
    { key: 'commit', name: t('commitId'), fieldName: 'commit', minWidth: 75, maxWidth: 100 },
    { key: 'author', name: t('commitAuthor'), fieldName: 'author', minWidth: 75, maxWidth: 200 },
    { key: 'status', name: t('status'), fieldName: 'status', minWidth: 100, maxWidth: 150 },
    { key: 'message', name: t('message'), fieldName: 'message', minWidth: 210, isMultiline: true },
  ];

  const groups: IGroup[] = getItemGroups(items);

  const getZeroDayContent = () => {
    if (deploymentCenterContext.siteConfig && deploymentCenterContext.siteConfig.properties.scmType === ScmType.None) {
      return (
        <>
          <div className={deploymentCenterCodeLogsNotConfigured}>
            <DeploymentCenterIcon filter="grayscale(100%)" />
            <h3>{t('deploymentCenterCodeLogsCICDNotConfiguredHeader')}</h3>
            <p>{t('deploymentCenterCodeLogsCICDNotConfiguredDescription')}</p>
            <PrimaryButton text={t('deploymentCenterCodeLogsCICDNotConfiguredGoToSettings')} onClick={() => goToSettingsOnClick()} />
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className={deploymentCenterCodeLogsNotConfigured}>
            <h3>{t('deploymentCenterCodeLogsNoDeployments')}</h3>;
          </div>
        </>
      );
    }
  };

  return (
    <>
      <DeploymentCenterCodeLogsTimer refreshLogs={refreshLogs} deleteLogs={showDeleteConfirmDialog} />

      <ConfirmDialog
        primaryActionButton={{
          title: t('delete'),
          onClick: deleteLogs,
        }}
        defaultActionButton={{
          title: t('cancel'),
          onClick: dismissDeleteConfirmDialog,
        }}
        title={t('deploymentCenterDeleteLogsConfirmationTitle')}
        content={t('deploymentCenterDeleteLogsConfirmationDescription')}
        hidden={!isDeleteConfirmDialogOpen}
        onDismiss={dismissDeleteConfirmDialog}
      />

      {isLogsDataRefreshing ? (
        getProgressIndicator()
      ) : deploymentsError ? (
        <div className={deploymentCenterLogsError}>{deploymentsError}</div>
      ) : deployments ? (
        <div className={deploymentCenterCodeLogsBox}>
          <DisplayTableWithEmptyMessage
            columns={columns}
            items={items}
            // selection={selection}
            selectionMode={SelectionMode.multiple}
            groups={groups}
          />
          {items.length === 0 && getZeroDayContent()}
        </div>
      ) : (
        getProgressIndicator()
      )}
      <CustomPanel isOpen={isLogPanelOpen} onDismiss={dismissLogPanel} type={PanelType.medium}>
        <DeploymentCenterCommitLogs commitId={currentCommitId} dismissLogPanel={dismissLogPanel} />
      </CustomPanel>
    </>
  );
};

export default DeploymentCenterCodeLogs;
