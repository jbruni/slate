const FILES = [
  '/config/settings_data.json',
  '/snippets/icon-youtube.liquid',
  '/layout/theme.liquid',
];

jest.mock('inquirer', () => {
  return {prompt: jest.fn(() => Promise.resolve({ignoreSettingsData: true}))};
});

jest.mock('@shopify/slate-env', () => {
  let __ignoreValue = '';
  return {
    __setIgnoreValue: value => (__ignoreValue = value),
    __resetIgnoreValue: () => (__ignoreValue = ''),
    getIgnoreFilesValue: () => __ignoreValue,
  };
});

const inquirer = require.requireMock('inquirer');
const env = require.requireMock('@shopify/slate-env');

describe('promptIfSettingsData()', () => {
  beforeEach(() => {
    inquirer.prompt.mockClear();
    env.__resetIgnoreValue();
  });

  test('prompts user if setting_data.json is not ignored in .env file and included in files to be uploaded', () => {
    const promptIfSettingsData = require('../prompt-if-settings-data');
    env.__setIgnoreValue('');
    promptIfSettingsData(FILES);
    expect(inquirer.prompt).toHaveBeenCalledTimes(1);
  });

  test('does not prompt if settings_data.json is not in the file list', () => {
    const promptIfSettingsData = require('../prompt-if-settings-data');
    env.__setIgnoreValue('');
    promptIfSettingsData([]);
    expect(inquirer.prompt).toHaveBeenCalledTimes(0);
  });

  test('does not prompt if setting_data.json is ignored in .env file', () => {
    const promptIfSettingsData = require('../prompt-if-settings-data');
    const globs = [
      '/config/settings_data.json',
      'config/settings_data.json',
      '/config/*',
      '/config/*.json',
      '**/settings_data.json',
    ];

    globs.forEach(glob => {
      env.__setIgnoreValue(glob);
      promptIfSettingsData(FILES);
    });

    expect(inquirer.prompt).toHaveBeenCalledTimes(0);
  });
});
