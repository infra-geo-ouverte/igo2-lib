import { KeyValuePipe } from './keyvalue.pipe';

describe('KeyvaluePipe', () => {
  it('create an instance', () => {
    const pipe = new KeyValuePipe();
    expect(pipe).toBeTruthy();
  });
});
