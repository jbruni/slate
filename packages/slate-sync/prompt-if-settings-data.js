const chalk = require('chalk');
const inquirer = require('inquirer');
const {getIgnoreFilesValue} = require('@shopify/slate-env');
const {event} = require('@shopify/slate-analytics');
const figures = require('figures');
const flatten = require('array-flatten');
const minimatch = require('minimatch');
const wrap = require('word-wrap');

const question = {
  type: 'confirm',
  name: 'ignoreSettingsData',
  message: " Skip uploading 'settings_data.json'?",
  default: false,
};

module.exports = function(files) {
  const ignoredFileGlobs = getIgnoreFilesValue().split(':');
  const ignoredFiles = flatten(
    ignoredFileGlobs.map(glob => {
      if (glob[0] !== '/') {
        glob = `/${glob}`;
      }
      return files.filter(minimatch.filter(glob));
    }),
  );

  if (
    !ignoredFiles.includes('/config/settings_data.json') &&
    files.includes('/config/settings_data.json')
  ) {
    console.log();
    console.log(
      wrap(
        `${chalk.yellow(
          figures.warning,
        )}  It looks like you are about to upload the 'settings_data.json' file. This can reset any customizations you've done in the Theme Editor to your current theme.`,
        {width: 80, indent: ''},
      ),
    );

    console.log();

    return inquirer.prompt([question]).then(answer => {
      if (answer.ignoreSettingsData) {
        return files.filter(file => file !== '/config/settings_data.json');
      } else {
        return files;
      }
    });
  } else {
    return Promise.resolve(files);
  }
};
