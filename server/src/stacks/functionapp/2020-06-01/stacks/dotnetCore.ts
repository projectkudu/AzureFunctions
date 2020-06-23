import { FunctionAppStack } from '../stack.model';

const dotnetCore2Point2EOL = new Date(2019, 12, 23);

export const dotnetCoreStack: FunctionAppStack = {
  displayText: '.NET Core',
  value: 'dotnetCore',
  preferredOs: 'windows',
  majorVersions: [
    {
      displayText: '.NET Core 3',
      value: '3',
      minorVersions: [
        {
          displayText: '.NET Core 3.1',
          value: '3.1',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '3.1',
              appInsightsSettings: {
                isSupported: true,
              },
              remoteDebuggingSupported: false,
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '3.1.301',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet',
              },
              siteConfigPropertiesDictionary: {
                Use32BitWorkerProcess: true,
              },
              supportedFunctionsExtensionVersions: ['~3'],
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'dotnet|3.1',
              appInsightsSettings: {
                isSupported: true,
              },
              remoteDebuggingSupported: false,
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '3.1.301',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet',
              },
              siteConfigPropertiesDictionary: {
                Use32BitWorkerProcess: false,
                linuxFxVersion: 'dotnet|3.1',
              },
              supportedFunctionsExtensionVersions: ['~3'],
            },
          },
        },
      ],
    },
    {
      displayText: '.NET Core 2',
      value: '2',
      minorVersions: [
        {
          displayText: '.NET Core 2.2',
          value: '2.2',
          stackSettings: {
            windowsRuntimeSettings: {
              runtimeVersion: '2.2',
              isDeprecated: true,
              appInsightsSettings: {
                isSupported: true,
              },
              remoteDebuggingSupported: false,
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '2.2.207',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet',
              },
              siteConfigPropertiesDictionary: {
                Use32BitWorkerProcess: true,
              },
              supportedFunctionsExtensionVersions: ['~2'],
              endOfLifeDate: dotnetCore2Point2EOL,
            },
            linuxRuntimeSettings: {
              runtimeVersion: 'dotnet|2.2',
              isDeprecated: true,
              appInsightsSettings: {
                isSupported: true,
              },
              remoteDebuggingSupported: false,
              gitHubActionSettings: {
                isSupported: true,
                supportedVersion: '2.2.207',
              },
              appSettingsDictionary: {
                FUNCTIONS_WORKER_RUNTIME: 'dotnet',
              },
              siteConfigPropertiesDictionary: {
                Use32BitWorkerProcess: false,
                linuxFxVersion: 'dotnet|2.2',
              },
              supportedFunctionsExtensionVersions: ['~2'],
              endOfLifeDate: dotnetCore2Point2EOL,
            },
          },
        },
      ],
    },
  ],
};
