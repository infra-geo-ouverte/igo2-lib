import type {
  LayerExtension,
  LayerExtensionInstance
} from './layer-extension.interface';

export class LayerExtensionManager<
  TOptions,
  TContext,
  TInstance extends LayerExtensionInstance
> {
  private _instances: TInstance[] = [];
  private _instancesByExtension = new Map<
    LayerExtension<TOptions, TContext, TInstance>,
    TInstance
  >();
  private _attached = false;

  attach(
    extensions: readonly LayerExtension<TOptions, TContext, TInstance>[],
    options: TOptions,
    context: TContext
  ): void {
    if (this._attached) {
      throw new Error('Layer extensions are already attached');
    }

    const sorted = extensions
      .map((extension, registrationIndex) => ({ extension, registrationIndex }))
      .filter(({ extension }) => extension.supports(options))
      .sort((left, right) => {
        const leftPriority = left.extension.priority ?? 0;
        const rightPriority = right.extension.priority ?? 0;

        if (leftPriority !== rightPriority) {
          return rightPriority - leftPriority;
        }

        return left.registrationIndex - right.registrationIndex;
      })
      .map(({ extension }) => extension);

    const instances: TInstance[] = [];
    const instancesByExtension = new Map<
      LayerExtension<TOptions, TContext, TInstance>,
      TInstance
    >();

    try {
      for (const extension of sorted) {
        const instance = extension.attach(context);
        instances.push(instance);
        instancesByExtension.set(extension, instance);
      }
    } catch (error) {
      try {
        destroyInReverse(instances);
      } catch {
        // Preserve the attachment error.
      }
      throw error;
    }

    this._instances = instances;
    this._instancesByExtension = instancesByExtension;
    this._attached = true;
  }

  getInstances(): readonly TInstance[] {
    return this._instances;
  }

  getInstance<TSelectedInstance extends TInstance>(
    extension: LayerExtension<TOptions, TContext, TSelectedInstance>
  ): TSelectedInstance | undefined {
    return this._instancesByExtension.get(extension) as
      TSelectedInstance | undefined;
  }

  destroy(): void {
    if (!this._attached) {
      return;
    }

    const instances = this._instances;
    this._instances = [];
    this._instancesByExtension.clear();
    this._attached = false;
    destroyInReverse(instances);
  }
}

function destroyInReverse(instances: readonly LayerExtensionInstance[]): void {
  let firstError: unknown;

  for (let i = instances.length - 1; i >= 0; i--) {
    try {
      instances[i].destroy();
    } catch (error) {
      firstError ??= error;
    }
  }

  if (firstError) {
    throw firstError;
  }
}
