import { LayerExtensionManager } from './layer-extension-manager';
import type {
  LayerExtension,
  LayerExtensionInstance
} from './layer-extension.interface';

type TestOptions = { id: string };
type TestContext = { name: string };

interface TestInstance extends LayerExtensionInstance {
  readonly id: string;
}

function makeExtension(
  id: string,
  opts: {
    priority?: number;
    supports?: (o: TestOptions) => boolean;
    onAttach?: () => void;
    onDestroy?: () => void;
    throwOnAttach?: boolean;
  } = {}
): LayerExtension<TestOptions, TestContext, TestInstance> {
  return {
    id,
    priority: opts.priority,
    supports: opts.supports ?? (() => true),
    attach(_ctx) {
      opts.onAttach?.();
      if (opts.throwOnAttach) {
        throw new Error(`attach failed: ${id}`);
      }
      return {
        id,
        destroy: opts.onDestroy ?? (() => void 0)
      };
    }
  };
}

describe('LayerExtensionManager', () => {
  const options: TestOptions = { id: 'layer-1' };
  const context: TestContext = { name: 'ctx' };

  it('excludes extensions whose supports() returns false', () => {
    const manager = new LayerExtensionManager<
      TestOptions,
      TestContext,
      TestInstance
    >();
    const attached = vi.fn();
    const ext = makeExtension('unsupported', {
      supports: () => false,
      onAttach: attached
    });

    manager.attach([ext], options, context);

    expect(attached).not.toHaveBeenCalled();
    expect(manager.getInstances()).toHaveLength(0);
  });

  it('orders by priority descending then by registration index ascending', () => {
    const manager = new LayerExtensionManager<
      TestOptions,
      TestContext,
      TestInstance
    >();
    const order: string[] = [];

    const extensions = [
      makeExtension('low', { priority: 0, onAttach: () => order.push('low') }),
      makeExtension('high', {
        priority: 10,
        onAttach: () => order.push('high')
      }),
      makeExtension('mid-first', {
        priority: 5,
        onAttach: () => order.push('mid-first')
      }),
      makeExtension('mid-second', {
        priority: 5,
        onAttach: () => order.push('mid-second')
      })
    ];

    manager.attach(extensions, options, context);

    expect(order).toEqual(['high', 'mid-first', 'mid-second', 'low']);
  });

  it('preserves registration order for equal priority', () => {
    const manager = new LayerExtensionManager<
      TestOptions,
      TestContext,
      TestInstance
    >();
    const order: string[] = [];

    manager.attach(
      [
        makeExtension('a', { onAttach: () => order.push('a') }),
        makeExtension('b', { onAttach: () => order.push('b') }),
        makeExtension('c', { onAttach: () => order.push('c') })
      ],
      options,
      context
    );

    expect(order).toEqual(['a', 'b', 'c']);
  });

  it('retrieves instances by extension identity when ids are duplicated', () => {
    const manager = new LayerExtensionManager<
      TestOptions,
      TestContext,
      TestInstance
    >();
    const first = makeExtension('duplicate');
    const second = makeExtension('duplicate');

    manager.attach([first, second], options, context);

    expect(manager.getInstance(first)).toBe(manager.getInstances()[0]);
    expect(manager.getInstance(second)).toBe(manager.getInstances()[1]);

    manager.destroy();

    expect(manager.getInstance(first)).toBeUndefined();
    expect(manager.getInstance(second)).toBeUndefined();
  });

  it('rejects reattachment until attached instances are destroyed', () => {
    const manager = new LayerExtensionManager<
      TestOptions,
      TestContext,
      TestInstance
    >();
    const extension = makeExtension('extension');

    manager.attach([extension], options, context);

    expect(() => manager.attach([extension], options, context)).toThrow(
      'Layer extensions are already attached'
    );

    manager.destroy();

    expect(() => manager.attach([extension], options, context)).not.toThrow();
  });

  it('destroys already-attached instances when a later attach throws, then re-throws', () => {
    const manager = new LayerExtensionManager<
      TestOptions,
      TestContext,
      TestInstance
    >();
    const destroyed: string[] = [];

    const extensions = [
      makeExtension('first', { onDestroy: () => destroyed.push('first') }),
      makeExtension('failing', { throwOnAttach: true })
    ];

    expect(() => manager.attach(extensions, options, context)).toThrow(
      'attach failed: failing'
    );
    expect(destroyed).toEqual(['first']);
    expect(manager.getInstances()).toHaveLength(0);
  });

  it('destroys instances in reverse attachment order', () => {
    const manager = new LayerExtensionManager<
      TestOptions,
      TestContext,
      TestInstance
    >();
    const destroyed: string[] = [];

    manager.attach(
      [
        makeExtension('a', { onDestroy: () => destroyed.push('a') }),
        makeExtension('b', { onDestroy: () => destroyed.push('b') }),
        makeExtension('c', { onDestroy: () => destroyed.push('c') })
      ],
      options,
      context
    );

    manager.destroy();

    expect(destroyed).toEqual(['c', 'b', 'a']);
  });

  it('continues teardown after a destroy error and throws the first error', () => {
    const manager = new LayerExtensionManager<
      TestOptions,
      TestContext,
      TestInstance
    >();
    const destroyed: string[] = [];
    const firstError = new Error('destroy-b');

    const extensions = [
      makeExtension('a', { onDestroy: () => destroyed.push('a') }),
      makeExtension('b', {
        onDestroy: () => {
          throw firstError;
        }
      }),
      makeExtension('c', { onDestroy: () => destroyed.push('c') })
    ];

    manager.attach(extensions, options, context);

    expect(() => manager.destroy()).toThrow(firstError);
    expect(destroyed).toContain('a');
    expect(destroyed).toContain('c');
  });

  it('is idempotent: calling destroy twice does not re-destroy instances', () => {
    const manager = new LayerExtensionManager<
      TestOptions,
      TestContext,
      TestInstance
    >();
    const destroyed: string[] = [];

    manager.attach(
      [makeExtension('a', { onDestroy: () => destroyed.push('a') })],
      options,
      context
    );

    manager.destroy();
    manager.destroy();

    expect(destroyed).toHaveLength(1);
  });
});
