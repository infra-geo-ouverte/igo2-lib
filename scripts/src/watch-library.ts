import { spawn } from 'child_process';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { first } from 'rxjs/operators';
import { pathExist } from './utils/file-system.utils';
import { PATHS } from './paths';
import { rm } from 'fs/promises';

type PackageName =
  | 'auth'
  | 'common'
  | 'context'
  | 'core'
  | 'geo'
  | 'integration'
  | 'utils';

interface PackageOptions {
  relateOn?: PackageName;
  observer: BehaviorSubject<boolean>;
}

const packagesDep: Map<PackageName, PackageOptions> = new Map([
  ['utils', { observer: new BehaviorSubject(false) }],
  ['core', { relateOn: 'utils', observer: new BehaviorSubject(false) }],
  ['common', { relateOn: 'core', observer: new BehaviorSubject(false) }],
  ['auth', { relateOn: 'common', observer: new BehaviorSubject(false) }],
  ['geo', { relateOn: 'auth', observer: new BehaviorSubject(false) }],
  ['context', { relateOn: 'geo', observer: new BehaviorSubject(false) }],
  ['integration', { relateOn: 'context', observer: new BehaviorSubject(false) }]
]);

(async () => {
  if (pathExist(PATHS.dist)) {
    await rm(PATHS.dist, { recursive: true });
  }

  packagesDep.forEach(async ({ relateOn, observer }, name) => {
    if (relateOn) {
      const relatedObserver = packagesDep.get(relateOn)!.observer;
      await firstValueFrom(
        relatedObserver.pipe(first((value) => value === true))
      );
    }

    handleWatchCommand(name, observer);
  });
})();

function handleWatchCommand(
  name: string,
  observer: BehaviorSubject<boolean>
): void {
  const cmd = spawn('npm.cmd', ['run', `_watch.${name}`]);

  cmd.stdout.on('data', (data: Buffer) => {
    const msg = data.toString();
    if (msg.includes('Compilation complete')) {
      observer.next(true);
    }
    console.log(msg);
  });

  cmd.stderr.on('data', (data: Buffer) => {
    console.error(data.toString());
  });
}
