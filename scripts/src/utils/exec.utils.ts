import { spawn } from 'child_process';

export function execWorkspaceCmd(
  name: string,
  endsPattern: string,
  args: string[]
): Promise<void> {
  return execCmd(endsPattern, [`--workspace=@igo2/${name}`, ...args]);
}

export function execCmd(
  endsPattern: string,
  args: string[]
): Promise<void> {
  return new Promise((resolve) => {
    const cmd = spawn('npm.cmd', [...args], {
      stdio: ['inherit', 'pipe', 'inherit']
    });

    cmd.stdout?.on('data', (data: Buffer) => {
      const msg = data.toString();
      if (msg.includes(endsPattern)) {
        resolve();
        return;
      }
      console.log(msg);
    });
  });
}
