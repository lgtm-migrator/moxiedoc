import { Builder } from './builder';
import { Exporter } from './exporter';
import * as Reporter from './reporter';
import * as fs from 'fs';
import * as matcher from 'matcher';
import * as path from 'path';

exports.Builder = Builder;
exports.Exporter = Exporter;

export interface MoxiedocSettings {
  out?: string;
  template?: string;
  verbose?: boolean;
  debug?: boolean;
  paths: string[];
  dry?: boolean;
}

/**
 * Process the specified files and generate documentation.
 *
 * @method process
 * @example
 * moxiedoc.process({
 *     template: 'cli',
 *     verbose: true,
 *     debug: false,
 *     paths: [
 *         'js/classes'
 *     ],
 *     out: 'output'
 * });
 * @param  {[type]} settings [description]
 * @return {[type]}          [description]
 */
function process (settings: MoxiedocSettings): void {
  settings.out = settings.out || 'tmp/out.zip';
  settings.template = settings.template || 'cli';

  if (settings.verbose) {
    Reporter.setLevel(Reporter.Levels.INFO);
  }

  if (settings.debug) {
    Reporter.setLevel(Reporter.Levels.DEBUG);
  }

  const builder = new Builder();

  function listFiles(dirPath: string, patterns: string[]) {
    let output: string[] = [];

    const matches = function (filePath: string) {
      return patterns.filter((pattern: string) => matcher.isMatch(path.basename(filePath), pattern)).length > 0;
    };

    fs.readdirSync(dirPath).forEach((filePath: string) => {
        filePath = path.join(dirPath, filePath);

        if (fs.statSync(filePath).isDirectory()) {
          output = output.concat(listFiles(filePath, patterns));
        } else if (matches(filePath)) {
          output.push(filePath);
        }
      });

    return output;
  }

  settings.paths.forEach((filePath: string) => {
      if (fs.statSync(filePath).isDirectory()) {
        listFiles(filePath, ['*.js', '*.ts']).forEach((filePath) => {
          builder.parser.parseFile(filePath);
        });
      } else {
        builder.parser.parseFile(filePath);
      }
    });

  builder.api.removePrivates();

  if (!settings.dry) {
    const exporter = new Exporter({
      template: settings.template
    });

    exporter.exportTo(builder.api, settings.out);
  }
}

export {
  process
};